const INTAKE_SHEETS = {
  worship_team: 'Worship Teams',
  ministry_interest: 'Ministries',
  church_group: 'Church Groups',
  leadership_contact: 'Leadership',
  story_submission: 'Our Story',
  calendar_event: 'Calendar Events',
  host_event: 'Hosted Events',
  worship_request: 'Worship Requests'
};

function doGet() {
  return json_({ ok: true, service: 'Redeemer Intake and Analytics' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error('This script must be bound to the Redeemer workbook.');
    if (data.kind === 'analytics') writeAnalytics_(ss, data);
    else if (data.kind === 'submission') writeSubmission_(ss, data);
    else throw new Error('Unknown payload kind.');
    return json_({ ok: true });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: String(error.message || error) });
  } finally {
    lock.releaseLock();
  }
}

function writeSubmission_(ss, data) {
  const type = String(data.form_type || 'other');
  const fields = data.payload || {};
  const row = Object.assign({
    submission_id: Utilities.getUuid(),
    submitted_at: data.submitted_at || new Date().toISOString(),
    form_type: type,
    status: data.status || 'New',
    owner: '',
    follow_up_date: '',
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    consent: data.consent === true,
    source_page: data.source_page || ''
  }, flatten_(fields));
  appendObject_(ss.getSheetByName('Master Intake'), row);
  appendObject_(ss.getSheetByName(INTAKE_SHEETS[type] || 'Other Submissions'), row);
}

function writeAnalytics_(ss, data) {
  appendObject_(ss.getSheetByName('Analytics Events'), Object.assign({
    occurred_at: data.occurred_at || new Date().toISOString(),
    event_name: data.event_name || '',
    session_id: data.session_id || '',
    page_path: data.page_path || '',
    page_title: data.page_title || '',
    referrer_host: data.referrer_host || '',
    device: data.device || '',
    metadata_json: JSON.stringify(data.metadata || {})
  }, flatten_(data.metadata || {})));
}

function appendObject_(sheet, object) {
  if (!sheet) throw new Error('Required sheet is missing. Import the provided workbook before deploying.');
  let headers = sheet.getLastColumn() ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].filter(String) : [];
  const newHeaders = Object.keys(object).filter(key => !headers.includes(key));
  if (newHeaders.length) {
    headers = headers.concat(newHeaders);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#075BE8').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }
  const values = headers.map(header => normalize_(object[header]));
  sheet.appendRow(values);
}

function flatten_(object) {
  const flat = {};
  Object.keys(object || {}).forEach(key => {
    const value = object[key];
    flat[key] = Array.isArray(value) ? value.join(', ') : value;
  });
  return flat;
}

function normalize_(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
