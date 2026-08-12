/**
 * 올바른 금융 홈페이지 이메일 접수용 Google Apps Script
 * Google Apps Script 새 프로젝트의 Code.gs에 붙여 넣고 웹 앱으로 배포합니다.
 */
const RECIPIENT_EMAIL = "kojynnn@gmail.com";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    const safe = (value) => String(value || "").replace(/[<>]/g, "");
    const requestType = safe(data.requestType) || "홈페이지 문의";
    const subject = `[올바른 금융] ${requestType} - ${safe(data.name)}`;
    const body = [
      "올바른 금융 홈페이지에 새로운 문의가 접수되었습니다.",
      "",
      `접수 일시: ${safe(data.timestamp)}`,
      `문의 구분: ${requestType}`,
      `이름: ${safe(data.name)}`,
      `연락처: ${safe(data.phone)}`,
      `선택 분야: ${safe(data.coverage) || "선택 없음"}`,
      `접수 페이지: ${safe(data.pageTitle)}`,
      `페이지 주소: ${safe(data.pageUrl)}`
    ].join("\n");

    MailApp.sendEmail({ to: RECIPIENT_EMAIL, subject, body, name: "올바른 금융 홈페이지" });
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(error) })).setMimeType(ContentService.MimeType.JSON);
  }
}
