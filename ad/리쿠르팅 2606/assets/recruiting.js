const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxfG3_3-BShzdr9x1dqZW9Pnh0bF4h54pGWH4s8A6yBXlMC_RnLcNtlmQt6IS7ECloX/exec";
const TELEGRAM_TOKEN = "8652544241:AAEiwI3_qEnPGmgc8YluREw-LAjNBnXXaNo";
const TELEGRAM_CHAT_ID = "8712434989";
const EXTRA_EMAILS = "jw20371035@gmail.com, jinwoo8506@gmail.com, kye1004s7@gmail.com";

function scrollToApply(){
  document.getElementById("apply").scrollIntoView({behavior:"smooth",block:"start"});
}

function formatPhone(value){
  let digits = value.replace(/\D/g,"").slice(0,11);
  if(digits.length > 7) return digits.slice(0,3)+"-"+digits.slice(3,7)+"-"+digits.slice(7);
  if(digits.length > 3) return digits.slice(0,3)+"-"+digits.slice(3);
  return digits;
}

function getCheckedTypes(form){
  return Array.from(form.querySelectorAll('input[name="careerType"]:checked')).map(input => input.value);
}

function sendTelegram(data){
  const message = [
    "*[메타리치 시그널그룹] 리쿠르팅 2606 입사지원*",
    "",
    "페이지: " + data.campaignStyle,
    "이름: " + data.name,
    "연락처: " + data.phone,
    "구분: " + data.position,
    "접수: " + data.timestamp
  ].join("\n");

  return fetch("https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/sendMessage", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "Markdown"
    })
  }).catch(() => {});
}

function openModal(){
  document.getElementById("successModal").classList.add("show");
}

function closeModal(){
  document.getElementById("successModal").classList.remove("show");
}

document.addEventListener("DOMContentLoaded", () => {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting) entry.target.classList.add("on");
    });
  }, {threshold:.12});
  document.querySelectorAll(".reveal, .benefit, .promise, .metric, .info-row").forEach(el => revealObserver.observe(el));

  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(!entry.isIntersecting || entry.target.dataset.done) return;
      entry.target.dataset.done = "1";
      const target = Number(entry.target.dataset.target || "0");
      const suffix = entry.target.dataset.suffix || "";
      const duration = 900;
      const start = Date.now();
      const tick = () => {
        const progress = Math.min((Date.now() - start) / duration, 1);
        const value = Math.round(target * (1 - Math.pow(1 - progress, 3)));
        entry.target.textContent = value.toLocaleString("ko-KR") + suffix;
        if(progress < 1) requestAnimationFrame(tick);
      };
      tick();
    });
  }, {threshold:.35});
  document.querySelectorAll(".count-up").forEach(el => countObserver.observe(el));

  document.querySelectorAll(".tab-widget").forEach(widget => {
    const buttons = widget.querySelectorAll(".tab-btn");
    const panels = widget.querySelectorAll(".tab-panel");
    buttons.forEach(button => {
      button.addEventListener("click", () => {
        const key = button.dataset.tab;
        buttons.forEach(item => item.classList.toggle("active", item === button));
        panels.forEach(panel => panel.classList.toggle("active", panel.dataset.panel === key));
      });
    });
  });

  document.querySelectorAll(".policy-open").forEach(button => {
    button.addEventListener("click", () => {
      const modal = document.getElementById("policyModal");
      if(!modal) return;
      modal.querySelector("h3").textContent = button.dataset.title || "개인정보 수집 및 이용 안내";
      modal.querySelector("p").textContent = button.dataset.body || "수집 항목은 이름과 연락처이며, 입사 상담 및 채용 안내 목적으로 사용됩니다. 상담 종료 후 지체 없이 파기합니다.";
      modal.classList.add("show");
    });
  });

  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener("input", () => {
      input.value = formatPhone(input.value);
    });
  });

  document.querySelectorAll(".apply-form").forEach(form => {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const name = form.name.value.trim();
      const phone = formatPhone(form.phone.value.trim());
      const types = getCheckedTypes(form);
      const consent = form.privacy.checked;

      if(!name || !phone){
        alert("이름과 연락처를 입력해주세요.");
        return;
      }
      if(types.length === 0){
        alert("신입 또는 경력을 선택해주세요.");
        return;
      }
      if(!consent){
        alert("개인정보 수집 및 이용에 동의해주세요.");
        return;
      }

      const button = form.querySelector(".submit-btn");
      const original = button.textContent;
      button.disabled = true;
      button.textContent = "접수 중...";

      const data = {
        formType: "recruit",
        campaign: "리쿠르팅 2606",
        campaignStyle: form.dataset.style || document.title,
        name,
        phone,
        type_new: types.includes("신입") ? "신입" : "",
        type_career: types.includes("경력") ? "경력" : "",
        position: types.join("+"),
        timestamp: new Date().toLocaleString("ko-KR"),
        extra_email: EXTRA_EMAILS
      };

      await Promise.all([
        fetch(SCRIPT_URL, {method:"POST", body:JSON.stringify(data)}).catch(() => {}),
        sendTelegram(data)
      ]);

      form.reset();
      button.disabled = false;
      button.textContent = original;
      openModal();
    });
  });

  const modal = document.getElementById("successModal");
  if(modal){
    modal.addEventListener("click", event => {
      if(event.target === modal) closeModal();
    });
  }

  const policyModal = document.getElementById("policyModal");
  if(policyModal){
    policyModal.addEventListener("click", event => {
      if(event.target === policyModal) policyModal.classList.remove("show");
    });
  }
});
