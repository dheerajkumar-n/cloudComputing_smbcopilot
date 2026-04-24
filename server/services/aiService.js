const OpenAI = require('openai');

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SYSTEM_PROMPT = `You are an AI assistant for a small business operations platform.
Respond ONLY with valid JSON, no markdown, no extra text:
{
  "intent": "check_stock|reorder_supplies|view_staff|manage_schedule|view_analytics|view_suppliers|create_shift|add_employee|remove_employee|update_stock|add_inventory|general",
  "entities": {
    "employeeName": "",
    "day": "",
    "startTime": "",
    "endTime": "",
    "itemName": "",
    "quantity": null,
    "unit": "",
    "role": "",
    "hourlyRate": null
  },
  "businessType": "",
  "action": "",
  "response": "",
  "followUpNeeded": false
}

Intent rules:
- "add/schedule [name] on [day] from X to Y" → create_shift
- "add employee/hire [name] as [role]" → add_employee
- "remove/fire/delete [name]" → remove_employee
- "add [qty][unit] [item]" or "add [item] to inventory" → add_inventory
- "update/set/restock [item] to [qty]" → update_stock
- "check/show inventory/stock" → check_stock
- "reorder/order supplies" → reorder_supplies
- "show/list staff/team" → view_staff
- "schedule/shifts" → manage_schedule
- "analytics/report/sales" → view_analytics
- "suppliers/vendors" → view_suppliers

Time: "10 am"→"10:00", "1 pm"→"13:00", "2:30pm"→"14:30"
Units: lbs, kg, gallons, liters, boxes, bottles, pieces, units, bags, cans, packs, dozens, sets, pairs, pods, rolls, jars, loaves`;

const INTENT_PATTERNS = [
  { regex: /(?:add|schedule|put)\s+(\w+)\s+(?:on\s+)?(\w+)(?:'s)?\s+(?:shift\s+)?from\s+([\d:]+\s*(?:am|pm)?)\s+to\s+([\d:]+\s*(?:am|pm)?)/i, intent: 'create_shift' },
  { regex: /(?:add|hire|create|onboard)\s+(?:employee|staff|worker)?\s*(\w+(?:\s+\w+)?)\s+as\s+([\w\s]+)/i, intent: 'add_employee' },
  { regex: /(?:remove|fire|delete|dismiss|deactivate)\s+(\w+(?:\s+\w+)?)/i, intent: 'remove_employee' },
  { regex: /add\s+(\d+(?:\.\d+)?)\s*(lbs?|kg|gallons?|liters?|l\b|boxes?|bottles?|pieces?|units?|bags?|cans?|packs?|dozens?|sets?|pairs?|pods?|rolls?|jars?|loaves?)?\s+(?:of\s+)?([\w\s]+?)(?:\s+to\s+(?:the\s+)?(?:inventory|stock))?$/i, intent: 'add_inventory' },
  { regex: /(?:update|set|restock|change)\s+([\w\s]+?)\s+(?:stock|quantity|qty)?\s+to\s+(\d+)/i, intent: 'update_stock' },
  { regex: /reorder|order more|restock all|low stock|running out/i, intent: 'reorder_supplies' },
  { regex: /inventory|stock|how much|supplies/i, intent: 'check_stock' },
  { regex: /(?:show|list|view)\s+(?:staff|employees|team|workers)/i, intent: 'view_staff' },
  { regex: /schedule|shift|appointment|calendar/i, intent: 'manage_schedule' },
  { regex: /sales|revenue|profit|analytics|report|performance/i, intent: 'view_analytics' },
  { regex: /supplier|vendor|distributor/i, intent: 'view_suppliers' }
];

function parseTime(timeStr) {
  if (!timeStr) return null;
  timeStr = timeStr.trim().toLowerCase();
  const match = timeStr.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) return null;
  let hours = parseInt(match[1]);
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const period = match[3];
  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function getNextWeekday(dayName) {
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const target = days.indexOf(dayName.toLowerCase());
  if (target === -1) return new Date();
  const today = new Date();
  const current = today.getDay();
  let diff = target - current;
  if (diff < 0) diff += 7;
  if (diff === 0) diff = 0;
  const result = new Date(today);
  result.setDate(today.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function mockParseIntent(message, businessType) {
  for (const { regex, intent } of INTENT_PATTERNS) {
    if (!regex.test(message)) continue;
    const entities = {};

    if (intent === 'create_shift') {
      const m = message.match(/(?:add|schedule|put)\s+(\w+)\s+(?:on\s+)?(\w+)(?:'s)?\s+(?:shift\s+)?from\s+([\d:]+\s*(?:am|pm)?)\s+to\s+([\d:]+\s*(?:am|pm)?)/i);
      if (m) { entities.employeeName = m[1]; entities.day = m[2]; entities.startTime = parseTime(m[3]); entities.endTime = parseTime(m[4]); }
    }
    if (intent === 'add_employee') {
      const m = message.match(/(?:add|hire|create|onboard)\s+(?:employee|staff|worker)?\s*(\w+(?:\s+\w+)?)\s+as\s+([\w\s]+)/i);
      if (m) { entities.employeeName = m[1].trim(); entities.role = m[2].trim(); }
    }
    if (intent === 'remove_employee') {
      const m = message.match(/(?:remove|fire|delete|dismiss|deactivate)\s+(\w+(?:\s+\w+)?)/i);
      if (m) { entities.employeeName = m[1].trim(); }
    }
    if (intent === 'add_inventory') {
      const m = message.match(/add\s+(\d+(?:\.\d+)?)\s*(lbs?|kg|gallons?|liters?|l\b|boxes?|bottles?|pieces?|units?|bags?|cans?|packs?|dozens?|sets?|pairs?|pods?|rolls?|jars?|loaves?)?\s+(?:of\s+)?([\w\s]+?)(?:\s+to\s+(?:the\s+)?(?:inventory|stock))?$/i);
      if (m) { entities.quantity = parseFloat(m[1]); entities.unit = m[2] ? m[2].replace(/s$/, '') : 'unit'; entities.itemName = m[3].trim(); }
    }
    if (intent === 'update_stock') {
      const m = message.match(/(?:update|set|restock|change)\s+([\w\s]+?)\s+(?:stock|quantity|qty)?\s+to\s+(\d+)/i);
      if (m) { entities.itemName = m[1].trim(); entities.quantity = parseInt(m[2]); }
    }

    return { intent, entities, businessType: businessType || '', action: intent, response: '', followUpNeeded: false };
  }

  return {
    intent: 'general', entities: {}, businessType: businessType || '', action: 'general',
    response: `I can help you with:\n• "Add 20kg coffee beans to inventory"\n• "Add John on Monday shift from 10am to 2pm"\n• "Remove Sarah"\n• "Check low stock"\n• "Reorder supplies"\n• "Show my staff"`,
    followUpNeeded: false
  };
}

async function parseIntent(message, businessType) {
  if (!openai) return mockParseIntent(message, businessType);
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', temperature: 0, max_tokens: 400,
      messages: [
        { role: 'system', content: `${SYSTEM_PROMPT}\nBusiness type: ${businessType}` },
        { role: 'user', content: message }
      ]
    });
    const parsed = JSON.parse(completion.choices[0].message.content.trim());
    if (parsed.entities?.startTime) parsed.entities.startTime = parseTime(parsed.entities.startTime) || parsed.entities.startTime;
    if (parsed.entities?.endTime) parsed.entities.endTime = parseTime(parsed.entities.endTime) || parsed.entities.endTime;
    return parsed;
  } catch (err) {
    console.error('AI fallback:', err.message);
    return mockParseIntent(message, businessType);
  }
}

module.exports = { parseIntent, getNextWeekday };
