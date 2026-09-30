/**
 * Registration site for the Stroop / STAI-Y study.
 * One Apps Script project serves the pages, writes to the bound Sheet,
 * and runs the daily reminder check. Run setupSheets() then
 * createDailyTrigger() once from the Apps Script editor before deploying.
 */

const SHEET_REGISTRATIONS = 'Registrations';
const SHEET_SLOTS = 'Slots';
const SHEET_CONFIG = 'Config';

function doGet(e) {
  const page = (e.parameter.page || 'landing');
  if (page === 'register') return renderRegisterPage();
  if (page === 'confirm') return handleConfirmAttendance(e.parameter.token);
  return renderLandingPage();
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Small set of thin line icons (no external icon font / emoji), used across
// the templates as <?!= svgIcon('clock') ?>. Keep this list in sync with
// preview/index.html, which inlines the same paths for the static mockup.
function svgIcon(name) {
  const common = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="icon-svg"';
  const paths = {
    monitor: '<rect x="2" y="4" width="20" height="13" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="10" x2="6" y2="10"/><line x1="10" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="14" y2="10"/><line x1="18" y1="10" x2="18" y2="10"/><line x1="6" y1="14" x2="18" y2="14"/>',
    clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>',
    mapPin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="2.3"/>',
    info: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><line x1="12" y1="8" x2="12" y2="8"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><polyline points="8 12.5 11 15.5 16 9.5"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    alertCircle: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12" y2="16"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    tag: '<path d="M20 12.5L12.5 20 4 11.5V4h7.5L20 12.5z"/><circle cx="8" cy="8" r="1" fill="currentColor" stroke="none"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/>',
    arrowRight: '<line x1="4" y1="12" x2="20" y2="12"/><polyline points="14 6 20 12 14 18"/>',
    home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9"/>'
  };
  return '<svg ' + common + '>' + (paths[name] || '') + '</svg>';
}

function renderLandingPage() {
  const tmpl = HtmlService.createTemplateFromFile('Landing');
  tmpl.registerUrl = ScriptApp.getService().getUrl() + '?page=register';
  return tmpl.evaluate()
    .setTitle('Étude Stroop — Inscription')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function renderRegisterPage() {
  const tmpl = HtmlService.createTemplateFromFile('Register');
  tmpl.slots = getAvailableSlots();
  tmpl.landingUrl = ScriptApp.getService().getUrl();
  return tmpl.evaluate()
    .setTitle('Inscription — Étude Stroop')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ---------- Slots ----------

function getAvailableSlots() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_SLOTS);
  const data = sheet.getDataRange().getValues();
  const header = data.shift();
  const idIdx = header.indexOf('SlotID');
  const dateIdx = header.indexOf('DateTime');
  const capIdx = header.indexOf('Capacity');
  const booked = getBookedCounts();

  return data
    .filter(row => row[idIdx])
    .map(row => {
      const id = row[idIdx];
      const capacity = Number(row[capIdx]) || 1;
      const dt = new Date(row[dateIdx]);
      return {
        id: id,
        dateTime: dt.toISOString(),
        label: Utilities.formatDate(dt, Session.getScriptTimeZone(), "EEEE d MMMM 'à' HH'h'mm"),
        remaining: capacity - (booked[id] || 0)
      };
    })
    .filter(s => s.remaining > 0 && new Date(s.dateTime) > new Date())
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
}

function getBookedCounts() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_REGISTRATIONS);
  const data = sheet.getDataRange().getValues();
  const header = data.shift();
  const slotIdx = header.indexOf('SlotID');
  const counts = {};
  data.forEach(row => {
    const id = row[slotIdx];
    if (id) counts[id] = (counts[id] || 0) + 1;
  });
  return counts;
}

// ---------- Registration submission ----------

function submitRegistration(form) {
  if (!form || !form.name || !form.email || !form.slotId || !form.consent) {
    return { ok: false, error: 'missing_fields' };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const slots = getAvailableSlots();
    const slot = slots.find(s => s.id === form.slotId);
    if (!slot) return { ok: false, error: 'slot_full' };

    const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_REGISTRATIONS);
    const token = Utilities.getUuid();
    sheet.appendRow([
      new Date(),
      form.name,
      form.email,
      form.affiliation || '',
      form.slotId,
      slot.label,
      JSON.stringify(form.eligibility || {}),
      form.consent ? 'Oui' : 'Non',
      'Non envoyé',
      '',
      token
    ]);

    try {
      sendConfirmationEmail(form.email, form.name, slot.label);
    } catch (err) {
      Logger.log('sendConfirmationEmail failed: ' + err);
    }
    try {
      maybeNotifyExperimenters(form.name, form.email, slot.label);
    } catch (err) {
      Logger.log('maybeNotifyExperimenters failed: ' + err);
    }

    return { ok: true, slotLabel: slot.label };
  } finally {
    lock.releaseLock();
  }
}

function sendConfirmationEmail(email, name, slotLabel) {
  const subject = 'Confirmation de votre inscription — Étude Stroop';
  const body =
    'Bonjour ' + name + ',\n\n' +
    "Votre inscription est bien enregistrée.\n\n" +
    'Créneau réservé : ' + slotLabel + '\n\n' +
    'Vous recevrez un email de rappel la veille de votre rendez-vous.\n\n' +
    'Merci de votre participation !';
  MailApp.sendEmail(email, subject, body);
}

function maybeNotifyExperimenters(name, email, slotLabel) {
  const config = getConfig();
  if (!config.notificationsEnabled || !config.experimenterEmails.length) return;
  const subject = 'Nouvelle inscription — Étude Stroop';
  const body =
    'Nouvelle inscription reçue :\n\n' +
    'Nom : ' + name + '\n' +
    'Email : ' + email + '\n' +
    'Créneau : ' + slotLabel;
  config.experimenterEmails.forEach(addr => MailApp.sendEmail(addr, subject, body));
}

function getConfig() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_CONFIG);
  const data = sheet.getDataRange().getValues();
  const notificationsEnabled = String(data[0][1]).trim().toUpperCase() === 'TRUE';

  // Find the "Emails des expérimentateurs..." label row by its text rather
  // than a fixed row number, so inserting/deleting rows above it in the
  // Sheet can't silently break this again.
  const labelRow = data.findIndex(row => String(row[0]).indexOf('Emails des') === 0);
  const experimenterEmails = [];
  if (labelRow !== -1) {
    for (let i = labelRow; i < data.length; i++) {
      const val = data[i][1];
      if (val) experimenterEmails.push(String(val).trim());
    }
  }
  return { notificationsEnabled, experimenterEmails };
}

// ---------- Daily reminder (time-driven trigger) ----------
// Runs once a day. Sends each participant with a slot tomorrow a
// confirm-your-attendance reminder, AND sends the subscribed experimenters
// (Config tab) a single digest email listing everyone coming tomorrow.

function sendDailyReminders() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_REGISTRATIONS);
  const data = sheet.getDataRange().getValues();
  const header = data[0];
  const idx = {
    name: header.indexOf('Name'),
    email: header.indexOf('Email'),
    affiliation: header.indexOf('Affiliation'),
    slotId: header.indexOf('SlotID'),
    slotLabel: header.indexOf('SlotLabel'),
    reminderSent: header.indexOf('ReminderSent'),
    token: header.indexOf('Token')
  };

  const slotsSheet = SpreadsheetApp.getActive().getSheetByName(SHEET_SLOTS);
  const slotsData = slotsSheet.getDataRange().getValues();
  const slotsHeader = slotsData.shift();
  const slotDateById = {};
  slotsData.forEach(row => {
    slotDateById[row[slotsHeader.indexOf('SlotID')]] = new Date(row[slotsHeader.indexOf('DateTime')]);
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = Utilities.formatDate(tomorrow, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const baseUrl = ScriptApp.getService().getUrl();
  const tomorrowRegistrations = [];

  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    const slotDate = slotDateById[row[idx.slotId]];
    if (!slotDate) continue;
    const slotDateStr = Utilities.formatDate(slotDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    if (slotDateStr !== tomorrowStr) continue;

    tomorrowRegistrations.push({
      name: row[idx.name],
      email: row[idx.email],
      affiliation: row[idx.affiliation],
      slotLabel: row[idx.slotLabel]
    });

    if (row[idx.reminderSent] === 'Envoyé') continue;

    const email = row[idx.email];
    const name = row[idx.name];
    const token = row[idx.token];
    const confirmUrl = baseUrl + '?page=confirm&token=' + encodeURIComponent(token);

    const subject = "Rappel — Votre rendez-vous demain pour l'étude Stroop";
    const body =
      'Bonjour ' + name + ',\n\n' +
      'Petit rappel : vous avez rendez-vous demain (' + row[idx.slotLabel] + ') pour l\'étude.\n\n' +
      'Merci de confirmer votre venue en cliquant ici :\n' + confirmUrl + '\n\n' +
      "Si vous ne pouvez plus venir, merci de nous prévenir par email dès que possible.\n\n" +
      'Au plaisir de vous voir bientôt !';
    MailApp.sendEmail(email, subject, body);
    sheet.getRange(r + 1, idx.reminderSent + 1).setValue('Envoyé');
  }

  sendExperimenterDigest(tomorrowRegistrations);
}

function sendExperimenterDigest(registrations) {
  const config = getConfig();
  if (!config.notificationsEnabled || !config.experimenterEmails.length) return;

  const subject = registrations.length
    ? 'Récap — ' + registrations.length + ' participant(s) demain (Étude Stroop)'
    : 'Récap — Aucun participant demain (Étude Stroop)';

  const body = registrations.length
    ? 'Participants attendus demain :\n\n' + registrations.map(p =>
        '- ' + p.name + ' (' + p.email + ') — ' + p.slotLabel + (p.affiliation ? ' — ' + p.affiliation : '')
      ).join('\n')
    : "Aucun participant n'est inscrit pour demain.";

  config.experimenterEmails.forEach(addr => MailApp.sendEmail(addr, subject, body));
}

function handleConfirmAttendance(token) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_REGISTRATIONS);
  const data = sheet.getDataRange().getValues();
  const header = data[0];
  const tokenIdx = header.indexOf('Token');
  const confirmedIdx = header.indexOf('Confirmation de venue (J-1)');
  let found = false;

  for (let r = 1; r < data.length; r++) {
    if (data[r][tokenIdx] === token) {
      sheet.getRange(r + 1, confirmedIdx + 1).setValue('Confirmée');
      found = true;
      break;
    }
  }

  const tmpl = HtmlService.createTemplateFromFile('Confirm');
  tmpl.success = found;
  tmpl.landingUrl = ScriptApp.getService().getUrl();
  return tmpl.evaluate().setTitle('Confirmation de présence');
}

// ---------- Admin menu (appears in the Sheet itself once opened) ----------

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Étude Stroop')
    .addItem('1. Initialiser les feuilles (une fois)', 'setupSheets')
    .addItem('2. Activer les rappels quotidiens (une fois)', 'createDailyTrigger')
    .addSeparator()
    .addItem('Générer les ID des nouveaux créneaux', 'fillMissingSlotIds')
    .addItem("Envoyer le récap/rappel de demain maintenant (test)", 'sendDailyRemindersNow')
    .addItem('Envoyer un email de test (à moi)', 'sendTestEmailToMe')
    .addItem("Vérifier mon quota d'emails restant aujourd'hui", 'checkEmailQuota')
    .addToUi();
}

// Free Gmail accounts get 100 MailApp sends per day, reset roughly every
// 24h. Heavy testing (test emails, reminders, real registrations) burns
// through this fast. If this shows 0, that's why emails stopped sending —
// wait for the reset, not a code bug.
function checkEmailQuota() {
  const remaining = MailApp.getRemainingDailyQuota();
  SpreadsheetApp.getUi().alert("Quota d'emails restant aujourd'hui : " + remaining);
}

function sendDailyRemindersNow() {
  sendDailyReminders();
  SpreadsheetApp.getUi().alert('Rappels aux participants et récap aux expérimentateurs envoyés (si applicable).');
}

// Sends a test email to whichever Google account is running this script,
// so you can check MailApp is actually able to deliver — without touching
// the Registrations sheet at all. Check your inbox, Spam, and the
// "Promotions"/"Updates" tabs if you use Gmail's tabbed inbox.
function sendTestEmailToMe() {
  const me = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
  MailApp.sendEmail(me, 'Email de test — Étude Stroop', "Si vous recevez ceci, l'envoi d'email fonctionne correctement.");
  SpreadsheetApp.getUi().alert('Email de test envoyé à : ' + me + '\n\nVérifiez la boîte de réception, le dossier Spam, et les onglets Promotions/Mises à jour si vous utilisez Gmail.');
}

// To add a new bookable slot: add a row to the Slots tab with just a
// DateTime and Capacity, leave SlotID blank, then run this (or use the
// "Étude Stroop" menu) to auto-fill the missing ID.
function fillMissingSlotIds() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_SLOTS);
  const data = sheet.getDataRange().getValues();
  const header = data[0];
  const idIdx = header.indexOf('SlotID');
  const dateIdx = header.indexOf('DateTime');
  let filled = 0;
  for (let r = 1; r < data.length; r++) {
    if (data[r][dateIdx] && !data[r][idIdx]) {
      sheet.getRange(r + 1, idIdx + 1).setValue('S' + Utilities.getUuid().slice(0, 8));
      filled++;
    }
  }
  SpreadsheetApp.getUi().alert(filled + ' créneau(x) mis à jour avec un identifiant.');
}

// ---------- One-time setup helpers (run manually from the editor) ----------

function setupSheets() {
  const ss = SpreadsheetApp.getActive();

  let reg = ss.getSheetByName(SHEET_REGISTRATIONS);
  if (!reg) reg = ss.insertSheet(SHEET_REGISTRATIONS);
  reg.clear();
  reg.appendRow(['Timestamp', 'Name', 'Email', 'Affiliation', 'SlotID', 'SlotLabel', 'Eligibility', 'Consent', 'ReminderSent', 'Confirmation de venue (J-1)', 'Token']);

  let slots = ss.getSheetByName(SHEET_SLOTS);
  if (!slots) slots = ss.insertSheet(SHEET_SLOTS);
  slots.clear();
  slots.appendRow(['SlotID', 'DateTime', 'Capacity']);
  const rows = [];
  const d = new Date();
  let count = 0;
  while (count < 15) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day === 2 || day === 4) { // Tuesdays and Thursdays — placeholder, edit freely
      [10, 14, 16].forEach(hour => {
        const dt = new Date(d);
        dt.setHours(hour, 0, 0, 0);
        rows.push(['S' + Utilities.getUuid().slice(0, 8), dt, 1]);
        count++;
      });
    }
  }
  rows.forEach(r => slots.appendRow(r));

  let config = ss.getSheetByName(SHEET_CONFIG);
  if (!config) config = ss.insertSheet(SHEET_CONFIG);
  config.clear();
  config.appendRow(['Notifications actives (TRUE/FALSE)', 'TRUE']);
  config.appendRow(['', '']);
  config.appendRow(['Emails des expérimentateurs abonnés :', '']);
  config.appendRow(['', 'exemple@uca.fr']);

  SpreadsheetApp.getUi().alert('Feuilles initialisées : Registrations, Slots, Config.');
}

function createDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'sendDailyReminders') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('sendDailyReminders')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();
  Logger.log('Daily trigger created: sendDailyReminders runs every day around 8am.');
}
