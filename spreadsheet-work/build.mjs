import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const workbook = Workbook.create();
const colors = {navy:"#050813", blue:"#075BE8", cyan:"#56D9FF", red:"#F21D3D", gold:"#DDB96F", paper:"#F7F9FF", ink:"#17223B", muted:"#667085", line:"#D9E0EF", white:"#FFFFFF", green:"#198754"};
const formSheets = [
  ["Worship Teams","worship_team"],["Ministries","ministry_interest"],["Church Groups","church_group"],["Leadership","leadership_contact"],
  ["Our Story","story_submission"],["Calendar Events","calendar_event"],["Hosted Events","host_event"],["Worship Requests","worship_request"]
];
const commonHeaders = ["submission_id","submitted_at","form_type","status","owner","follow_up_date","name","email","phone","consent","source_page"];

const dashboard = workbook.worksheets.add("Dashboard");
const master = workbook.worksheets.add("Master Intake");
formSheets.forEach(([name]) => workbook.worksheets.add(name));
const other = workbook.worksheets.add("Other Submissions");
const events = workbook.worksheets.add("Analytics Events");
const analytics = workbook.worksheets.add("Analytics Summary");
const setup = workbook.worksheets.add("Setup");

function titleBand(sheet, title, subtitle, endCol="H") {
  sheet.showGridLines = false;
  sheet.getRange(`A1:${endCol}1`).merge();
  sheet.getRange("A1").values = [[title]];
  sheet.getRange(`A1:${endCol}1`).format = {fill:colors.navy,font:{bold:true,color:colors.white,size:20},rowHeight:34,verticalAlignment:"center"};
  sheet.getRange(`A2:${endCol}2`).merge();
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange(`A2:${endCol}2`).format = {fill:colors.paper,font:{color:colors.muted,italic:true},rowHeight:26,verticalAlignment:"center"};
}

function formatDataSheet(sheet, headers) {
  sheet.showGridLines = false;
  sheet.getRangeByIndexes(0,0,1,headers.length).values = [headers];
  sheet.getRangeByIndexes(0,0,1,headers.length).format = {fill:colors.blue,font:{bold:true,color:colors.white},rowHeight:28,wrapText:true,verticalAlignment:"center"};
  sheet.freezePanes.freezeRows(1);
  sheet.getRangeByIndexes(1,0,1999,headers.length).format = {font:{color:colors.ink,size:10},borders:{insideHorizontal:{style:"thin",color:colors.line}}};
  sheet.getRange("B2:B2000").format.numberFormat = "yyyy-mm-dd hh:mm";
  sheet.getRange("F2:F2000").format.numberFormat = "yyyy-mm-dd";
  sheet.getRangeByIndexes(0,0,2000,headers.length).format.wrapText = true;
  sheet.getRangeByIndexes(0,0,2000,headers.length).format.autofitColumns();
  sheet.getRange("A:A").format.columnWidth = 24;
  sheet.getRange("B:B").format.columnWidth = 20;
  sheet.getRange("C:C").format.columnWidth = 20;
  sheet.getRange("D:F").format.columnWidth = 16;
  sheet.getRange("G:G").format.columnWidth = 22;
  sheet.getRange("H:I").format.columnWidth = 24;
  sheet.getRange("K:K").format.columnWidth = 32;
  sheet.getRange("D2:D2000").dataValidation = {rule:{type:"list",values:["New","In Review","Waiting","Scheduled","Completed","Archived"]}};
}

formatDataSheet(master, commonHeaders);
formSheets.forEach(([name]) => formatDataSheet(workbook.worksheets.getItem(name), commonHeaders));
formatDataSheet(other, commonHeaders);
formatDataSheet(events, ["occurred_at","event_name","session_id","page_path","page_title","referrer_host","device","metadata_json","label","destination","form_type","percent","seconds","provider"]);
events.getRange("A2:A2000").format.numberFormat = "yyyy-mm-dd hh:mm";

titleBand(dashboard,"Redeemer Intake & Website Analytics","Live summaries populate after the Google Apps Script web endpoint is connected.","L");
dashboard.getRange("A4:C4").values = [["INTAKE OVERVIEW","VALUE","DEFINITION"]];
dashboard.getRange("A5:A9").values = [["Total submissions"],["New"],["In review"],["Completed"],["Forms represented"]];
dashboard.getRange("B5:B9").formulas = [["=COUNTA('Master Intake'!$A$2:$A$2000)"],["=COUNTIF('Master Intake'!$D$2:$D$2000,\"New\")"],["=COUNTIF('Master Intake'!$D$2:$D$2000,\"In Review\")"],["=COUNTIF('Master Intake'!$D$2:$D$2000,\"Completed\")"],["=COUNTIF(F14:F21,\">0\")"]];
dashboard.getRange("C5:C9").values = [["All website intake records"],["Not yet assigned"],["Being handled"],["Follow-up complete"],["Intake types with activity"]];
dashboard.getRange("E4:G4").values = [["WEBSITE OVERVIEW","VALUE","DEFINITION"]];
dashboard.getRange("E5:E10").values = [["Page views"],["Unique sessions"],["Form starts"],["Form submissions"],["Giving clicks"],["Calendar clicks"]];
dashboard.getRange("F5:F10").formulas = [["=COUNTIF('Analytics Events'!$B$2:$B$10000,\"page_view\")"],["=COUNTIF('Analytics Events'!$B$2:$B$10000,\"session_start\")"],["=COUNTIF('Analytics Events'!$B$2:$B$10000,\"form_start\")"],["=COUNTIF('Analytics Events'!$B$2:$B$10000,\"form_submit\")"],["=COUNTIF('Analytics Events'!$B$2:$B$10000,\"giving_click\")"],["=COUNTIF('Analytics Events'!$B$2:$B$10000,\"calendar_click\")"]];
dashboard.getRange("G5:G10").values = [["Page loads recorded"],["Anonymous browser sessions"],["Visitors who began a form"],["Forms sent successfully"],["Square checkout clicks"],["Google Calendar clicks"]];
dashboard.getRange("A4:C9").format.borders = {preset:"outside",style:"thin",color:colors.line};
dashboard.getRange("E4:G10").format.borders = {preset:"outside",style:"thin",color:colors.line};
dashboard.getRange("A4:C4").format = dashboard.getRange("E4:G4").format = {fill:colors.blue,font:{bold:true,color:colors.white}};
dashboard.getRange("B5:B9").format = dashboard.getRange("F5:F10").format = {fill:colors.paper,font:{bold:true,color:colors.blue,size:16},numberFormat:"#,##0"};
dashboard.getRange("A12:B12").values = [["FORM TYPE","SUBMISSIONS"]];
dashboard.getRange("A13:A20").values = formSheets.map(([name]) => [name]);
dashboard.getRange("B13:B20").formulas = formSheets.map(([,type]) => [`=COUNTIF('Master Intake'!$C$2:$C$2000,"${type}")`]);
dashboard.getRange("E12:F12").values = [["FORM TYPE","SUBMISSIONS"]];
dashboard.getRange("E13:E20").values = formSheets.map(([name]) => [name]);
dashboard.getRange("F13:F20").formulas = formSheets.map(([,type]) => [`=COUNTIF('Master Intake'!$C$2:$C$2000,"${type}")`]);
dashboard.getRange("A12:B20").format.borders = {preset:"all",style:"thin",color:colors.line};
dashboard.getRange("A12:B12").format = dashboard.getRange("E12:F12").format = {fill:colors.red,font:{bold:true,color:colors.white}};
const intakeChart = dashboard.charts.add("bar", dashboard.getRange("E12:F20"));
intakeChart.title = "Submissions by intake type"; intakeChart.hasLegend = false; intakeChart.setPosition("H4","L18");
dashboard.getRange("A1:L22").format.font = {name:"Aptos",color:colors.ink};
dashboard.getRange("A1:L1").format.font = {name:"Georgia",bold:true,color:colors.white,size:20};
dashboard.getRange("A:A").format.columnWidth = 24; dashboard.getRange("B:B").format.columnWidth = 15; dashboard.getRange("C:C").format.columnWidth = 30;
dashboard.getRange("D:D").format.columnWidth = 3; dashboard.getRange("E:E").format.columnWidth = 24; dashboard.getRange("F:F").format.columnWidth = 15; dashboard.getRange("G:G").format.columnWidth = 30;
dashboard.freezePanes.freezeRows(2);

titleBand(analytics,"Website Analytics Summary","Counts are calculated from Analytics Events. Filters and date controls can be added in Google Sheets.","K");
analytics.getRange("A4:F4").values = [["Page","Views","Unique sessions","Form starts","Form submits","Avg exit seconds"]];
const pages = ["index.html","visit.html","watch-live.html","calendar.html","give.html","ministries.html","intake.html","history.html","contact.html"];
analytics.getRange("A5:A13").values = pages.map(x=>[x]);
analytics.getRange("B5:B13").formulas = pages.map((_,i)=>[`=COUNTIFS('Analytics Events'!$D$2:$D$10000,A${i+5},'Analytics Events'!$B$2:$B$10000,"page_view")`]);
analytics.getRange("C5:C13").formulas = pages.map((_,i)=>[`=COUNTIFS('Analytics Events'!$D$2:$D$10000,A${i+5},'Analytics Events'!$B$2:$B$10000,"session_start")`]);
analytics.getRange("D5:D13").formulas = pages.map((_,i)=>[`=COUNTIFS('Analytics Events'!$D$2:$D$10000,A${i+5},'Analytics Events'!$B$2:$B$10000,"form_start")`]);
analytics.getRange("E5:E13").formulas = pages.map((_,i)=>[`=COUNTIFS('Analytics Events'!$D$2:$D$10000,A${i+5},'Analytics Events'!$B$2:$B$10000,"form_submit")`]);
analytics.getRange("F5:F13").formulas = pages.map((_,i)=>[`=IFERROR(AVERAGEIFS('Analytics Events'!$M$2:$M$10000,'Analytics Events'!$D$2:$D$10000,A${i+5},'Analytics Events'!$B$2:$B$10000,"page_exit"),0)`]);
analytics.getRange("A4:F13").format.borders = {preset:"all",style:"thin",color:colors.line};
analytics.getRange("A4:F4").format = {fill:colors.blue,font:{bold:true,color:colors.white}};
analytics.getRange("B5:F13").format.numberFormat = "#,##0";
const pageChart = analytics.charts.add("bar", analytics.getRange("A4:B13"));
pageChart.title = "Page views by page"; pageChart.hasLegend = false; pageChart.setPosition("H4","N19");
analytics.getRange("A:A").format.columnWidth = 24; analytics.getRange("B:F").format.columnWidth = 16; analytics.freezePanes.freezeRows(4);

titleBand(setup,"Setup & Data Dictionary","Follow these steps once after importing this workbook into Google Sheets.","H");
setup.getRange("A4:B10").values = [
  ["STEP","ACTION"],[1,"Open Extensions → Apps Script in the imported Google Sheet."],[2,"Paste the repository file google-apps-script/Code.gs into the editor."],[3,"Deploy as a Web app. Execute as Me; access Anyone."],[4,"Copy the /exec deployment URL."],[5,"Paste it into googleSheetsWebAppUrl in assets/js/config.js."],[6,"Submit test forms and verify Master Intake, form-specific tabs, and Analytics Events."]
];
setup.getRange("A12:B18").values = [
  ["FIELD","MEANING"],["status","New, In Review, Waiting, Scheduled, Completed, or Archived"],["owner","Staff member responsible for follow-up"],["follow_up_date","Next planned action date"],["session_id","Anonymous per-browser-tab session identifier"],["metadata_json","Event details such as click label or scroll depth"],["source_page","Website address where a form was submitted"]
];
setup.getRange("A4:B10").format.borders = setup.getRange("A12:B18").format.borders = {preset:"all",style:"thin",color:colors.line};
setup.getRange("A4:B4").format = setup.getRange("A12:B12").format = {fill:colors.blue,font:{bold:true,color:colors.white}};
setup.getRange("A:A").format.columnWidth = 22; setup.getRange("B:B").format.columnWidth = 70; setup.getRange("A1:H18").format.wrapText = true;

const outputDir = fileURLToPath(new URL("../outputs/intake-analytics/", import.meta.url));
await fs.mkdir(outputDir, {recursive:true});
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(`${outputDir}/Redeemer_Intake_and_Analytics.xlsx`);
const dashboardPreview = await workbook.render({sheetName:"Dashboard",range:"A1:L22",scale:1.25,format:"png"});
await fs.writeFile(`${outputDir}/dashboard-preview.png`,new Uint8Array(await dashboardPreview.arrayBuffer()));
const setupPreview = await workbook.render({sheetName:"Setup",range:"A1:H18",scale:1.1,format:"png"});
await fs.writeFile(`${outputDir}/setup-preview.png`,new Uint8Array(await setupPreview.arrayBuffer()));
console.log((await workbook.inspect({kind:"table",range:"Dashboard!A1:G20",include:"values,formulas",tableMaxRows:20,tableMaxCols:8})).ndjson);
console.log((await workbook.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:100},summary:"formula error scan"})).ndjson);
