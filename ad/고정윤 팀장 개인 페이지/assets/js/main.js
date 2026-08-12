const CONFIG = {
  // google-apps-script-email.js를 배포한 뒤 생성된 /exec 주소를 아래에 붙여 넣으세요.
  googleAppsScriptUrl: ""
};

const introLoader = document.getElementById("introLoader");
if (introLoader) {
  const introKey = "rightFinanceIntroPlayed";
  let alreadyPlayed = false;
  try { alreadyPlayed = sessionStorage.getItem(introKey) === "Y"; } catch (error) {}
  if (new URLSearchParams(location.search).get("intro") === "1") alreadyPlayed = false;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const closeIntro = () => {
    introLoader.classList.add("hide");
    document.body.classList.remove("intro-active");
    document.documentElement.classList.add("intro-seen");
    try { sessionStorage.setItem(introKey, "Y"); } catch (error) {}
  };

  if (alreadyPlayed || reduceMotion) {
    introLoader.classList.add("hide");
  } else {
    document.body.classList.add("intro-active");
    const timer = window.setTimeout(closeIntro, 4700);
    introLoader.querySelector("[data-intro-skip]")?.addEventListener("click", () => {
      window.clearTimeout(timer);
      closeIntro();
    });
  }
}

const isMobile = window.matchMedia("(max-width: 768px)").matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

document.querySelectorAll("[data-mobile-href]").forEach((link) => {
  if (isMobile) link.href = link.dataset.mobileHref;
});

const comments = {
  "보험 보장 분석": "가입 중인 보험의 보장 범위, 중복, 공백과 납입 부담을 함께 확인합니다.",
  "연금": "예상 은퇴 시점과 필요한 생활비를 바탕으로 현재 준비 수준을 살펴봅니다.",
  "상속": "가족 구성과 자산 상황에 따라 미리 확인해야 할 기본 사항을 살펴봅니다.",
  "절세": "현재 상황에서 확인할 수 있는 합법적인 세제 기준과 준비 방향을 살펴봅니다.",
  "보험금 청구": "청구 가능한 보장과 필요한 서류, 진행 순서를 함께 확인합니다.",
  "기존 보험 점검": "갱신형 비중, 중복 보장, 보장 공백과 보험료 부담을 함께 살펴봅니다."
};

function selectedCoverage() {
  return [...document.querySelectorAll('input[name="coverage"]:checked')].map((input) => input.value);
}

function updateCoverageComment() {
  const box = document.getElementById("coverageComment");
  if (!box) return;
  const selected = selectedCoverage();
  if (!selected.length) {
    box.innerHTML = "<strong>선택한 분야의 확인 내용을 안내해 드립니다.</strong><ul><li>현재 상황과 가입 내용을 바탕으로 필요한 부분을 함께 살펴봅니다.</li></ul>";
    return;
  }
  box.innerHTML = `<strong>${selected.length === 1 ? selected[0] : "선택한 분야"} 확인 내용</strong><ul>${selected.map((item) => `<li>${comments[item]}</li>`).join("")}</ul>`;
}

document.querySelectorAll('input[name="coverage"]').forEach((input) => input.addEventListener("change", updateCoverageComment));
updateCoverageComment();

function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

document.querySelectorAll('input[name="phone"]').forEach((input) => {
  input.addEventListener("input", () => { input.value = formatPhone(input.value); });
});

const submitModal = document.getElementById("submitModal");

function setSubmitModal(state) {
  if (!submitModal) return;
  const title = submitModal.querySelector("h3");
  const desc = submitModal.querySelector("p");
  submitModal.classList.add("show");
  submitModal.classList.toggle("done", state === "done");
  submitModal.setAttribute("aria-hidden", "false");
  title.textContent = state === "done" ? "신청이 완료되었습니다" : "신청 정보를 전송 중입니다";
  desc.textContent = state === "done" ? "확인 후 직접 연락드리겠습니다." : "잠시만 기다려 주세요.";
}

function closeSubmitModal() {
  if (!submitModal) return;
  submitModal.classList.remove("show", "done");
  submitModal.setAttribute("aria-hidden", "true");
}

if (submitModal) {
  submitModal.addEventListener("click", (event) => {
    if (event.target === submitModal || event.target.closest("[data-modal-close]")) closeSubmitModal();
  });
}

async function submitLead(form) {
  const message = form.querySelector(".form-message");
  const button = form.querySelector('button[type="submit"]');
  const name = form.elements.name?.value.trim() || "";
  const phone = form.elements.phone?.value.trim() || "";
  const privacy = form.elements.privacy?.checked;
  const requestType = form.dataset.formType || "문의";
  const coverage = selectedCoverage();

  message.classList.remove("error");
  message.textContent = "";
  if (!name || !phone || !privacy) {
    message.classList.add("error");
    message.textContent = "이름, 연락처, 개인정보 동의를 확인해 주세요.";
    return;
  }
  if (!CONFIG.googleAppsScriptUrl) {
    message.classList.add("error");
    message.textContent = "이메일 접수 설정 전입니다. 전화 또는 카카오톡으로 문의해 주세요.";
    return;
  }

  const payload = {
    timestamp: new Date().toLocaleString("ko-KR"),
    name,
    phone,
    requestType,
    coverage: coverage.join(", "),
    pageTitle: document.title,
    pageUrl: location.href
  };

  try {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = "전송 중...";
    setSubmitModal("loading");
    await fetch(CONFIG.googleAppsScriptUrl, { method: "POST", mode: "no-cors", body: JSON.stringify(payload) });
    form.reset();
    updateCoverageComment();
    setSubmitModal("done");
  } catch (error) {
    message.classList.add("error");
    message.textContent = "전송에 실패했습니다. 전화 또는 카카오톡으로 문의해 주세요.";
    closeSubmitModal();
  } finally {
    button.disabled = false;
    button.textContent = button.dataset.originalText || "신청하기";
  }
}

document.querySelectorAll(".lead-form").forEach((form) => {
  form.addEventListener("submit", (event) => { event.preventDefault(); submitLead(form); });
});

function setupTabs(buttonSelector, panelSelector, buttonData, panelData) {
  const buttons = [...document.querySelectorAll(buttonSelector)];
  const panels = [...document.querySelectorAll(panelSelector)];
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset[buttonData];
      buttons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle("active", selected);
        item.setAttribute("aria-selected", String(selected));
      });
      panels.forEach((panel) => {
        const selected = panel.dataset[panelData] === value;
        panel.hidden = !selected;
        panel.classList.toggle("active", selected);
      });
    });
  });
}

setupTabs("[data-partner-tab]", "[data-partner-panel]", "partnerTab", "partnerPanel");
setupTabs("[data-news-tab]", "[data-news-page]", "newsTab", "newsPage");

const consumerModal = document.getElementById("consumerModal");
let consumerTrigger = null;

function openConsumerModal(trigger) {
  if (!consumerModal) return;
  consumerTrigger = trigger;
  consumerModal.classList.add("show");
  consumerModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  consumerModal.querySelector("[data-consumer-close]")?.focus();
}

function closeConsumerModal() {
  if (!consumerModal) return;
  consumerModal.classList.remove("show");
  consumerModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  consumerTrigger?.focus();
}

document.querySelectorAll("[data-consumer-open]").forEach((button) => {
  button.addEventListener("click", () => openConsumerModal(button));
});

if (consumerModal) {
  consumerModal.addEventListener("click", (event) => {
    if (event.target === consumerModal || event.target.closest("[data-consumer-close]")) closeConsumerModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && consumerModal.classList.contains("show")) closeConsumerModal();
  });
}
