/* ==========================================================
   송도키즈 학습심리발달클리닉 홈페이지 스크립트
   ----------------------------------------------------------
   ▼ 운영자가 채울 곳은 아래 CLINIC 설정뿐입니다.
   ========================================================== */
const CLINIC = {
  name: '송도키즈 학습심리발달클리닉',
  phone: '010-8108-8275',

  // 문자 상담을 받을 휴대폰 번호
  smsNumber: '010-8108-8275',

  // 상담 메일을 받을 주소 (예: 'songdokids@naver.com')
  email: '',

  // (선택) 구글 Apps Script 웹앱 주소. 넣으면 "이메일로 보내기"가
  // 방문자의 메일 앱을 거치지 않고 클리닉 메일로 바로 전송되고, 구글 시트에도 쌓입니다.
  // 설치 방법: google-apps-script/설치방법.md
  appsScriptUrl: '',

  kakaoChat: 'https://pf.kakao.com/_xjqXln/chat',

  // (선택) 운영 시간과 주차 안내. 비워 두면 페이지에 적힌 기본 문구가 보입니다.
  // 시간은 클리닉 안내 책자 기준이고, 일요일과 공휴일은 운영하지 않습니다(2026-11-10 확인). 줄을 바꾸려면 \n 을 넣습니다.
  // 점심시간은 입구 유리문 사진(2026-11-10)에 적힌 내용입니다.
  hours: '평일 09:30~18:30\n토요일 09:00~17:00\n점심시간 13:00~14:00\n일요일·공휴일 휴무',
  parking: ''   // 예: '상가 지하 주차장 2시간 무료'
};

/* ---------- 고민별 안내 데이터 ----------
   group: 화면의 묶음(talk 말, think 생각, heart 마음, body 몸, bond 관계, checkup 영유아검진)
   area : 상담 신청서의 "걱정되는 부분" 항목 이름 */
const LANG_TEST = '언어발달검사 (SELSI·PRES·REVT 등 연령에 맞게)';
const SOCIAL_GROUP = '사회성 그룹 「나의 학교 생활을 부탁해」';

const CONCERNS = [
  { id: 'late-talk', group: 'talk', label: '말이 또래보다 늦어요', area: '언어·발음',
    tests: [LANG_TEST], programs: ['언어치료'] },
  { id: 'pronounce', group: 'talk', label: '발음이 정확하지 않아요', area: '언어·발음',
    tests: [LANG_TEST], programs: ['언어치료'] },
  { id: 'stutter', group: 'talk', label: '말할 때 더듬거나 막혀요', area: '언어·발음',
    tests: [LANG_TEST], programs: ['언어치료'] },

  { id: 'focus', group: 'think', label: '산만하고 집중을 잘 못 해요', area: '주의집중',
    tests: ['ATA 정밀 주의력 검사 (만 5세 이상)', '웩슬러 지능검사 (K-WPPSI·K-WISC)'], programs: ['감각통합치료'] },
  { id: 'learning', group: 'think', label: '학습 속도가 더뎌요', area: '인지·학습',
    tests: ['웩슬러 지능검사 (K-WPPSI·K-WISC)', LANG_TEST, '학습 성향 검사'], programs: ['인지치료', '학습치료'] },

  { id: 'sensitive', group: 'heart', label: '예민하고 고집이 세요', area: '정서·행동',
    tests: ['TCI 기질검사'], programs: ['놀이치료'] },
  { id: 'anxious', group: 'heart', label: '불안이 크고 낯을 많이 가려요', area: '정서·행동',
    tests: ['TCI 기질검사', 'CBCL 행동평가척도'], programs: ['놀이치료'] },
  { id: 'emotion', group: 'heart', label: '감정 표현이 서툴러요', area: '정서·행동',
    tests: ['CBCL 행동평가척도', 'K-CDI 아동발달검사'], programs: ['놀이치료'] },

  { id: 'sensory', group: 'body', label: '소리나 촉감에 유난히 예민해요', area: '감각·운동',
    tests: ['작업치료(감각) 평가'], programs: ['감각통합치료'] },
  { id: 'motor', group: 'body', label: '몸 움직임이 서툴러요', area: '감각·운동',
    tests: ['작업치료(감각) 평가'], programs: ['감각통합치료'] },

  { id: 'peers', group: 'bond', label: '친구와 어울리기 어려워해요', area: '사회성·적응',
    tests: ['K-CDI 아동발달검사', 'CBCL 행동평가척도'], programs: [SOCIAL_GROUP, '놀이치료'] },
  { id: 'adapt', group: 'bond', label: '어린이집·학교 적응이 걱정돼요', area: '사회성·적응',
    tests: ['K-SNAP 의사소통 발달 검사', 'CBCL 행동평가척도'], programs: [SOCIAL_GROUP] },
  { id: 'parenting', group: 'bond', label: '아이와 어떻게 놀아 줘야 할지 모르겠어요', area: '양육 상담',
    tests: ['PCPA 부모-아동 상호작용 놀이평가', '부모양육태도검사'], programs: ['해석 상담'] },

  { id: 'checkup', group: 'checkup', label: '영유아검진에서 ‘심화평가 권고’를 받았어요', area: '영유아검진 정밀검사',
    tests: ['지능·발달·언어·자폐·주의집중력 검사', '작업치료 평가'], programs: ['보건소 정밀검사비 지원 안내'] }
];

/* ---------- 공통 도구 ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const isLocal = location.protocol === 'file:' || ['localhost', '127.0.0.1', ''].includes(location.hostname);
const isMobile = window.matchMedia('(pointer: coarse)').matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const isApple = /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent);
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

// 번호가 줄 끝에서 끊기지 않도록 끊기지 않는 하이픈(U+2011)으로 바꿔 보여 준다.
const noBreak = str => String(str).replace(/-/g, '‑');

let toastTimer;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 3200);
}

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) { /* 아래 방법으로 다시 시도 */ }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
  ta.remove();
  return ok;
}

function smsHref(number, body) {
  const num = number.replace(/[^\d+]/g, '');
  if (!body) return `sms:${num}`;
  return `sms:${num}${isApple ? '&' : '?'}body=${encodeURIComponent(body)}`;
}

function mailHref(email, subject, body) {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  return `mailto:${email}?${params.toString().replace(/\+/g, '%20')}`;
}

/* ---------- 머리말: 스크롤 표시와 모바일 메뉴 ---------- */
(function header() {
  const headerEl = $('.site-header');
  const nav = $('#site-nav');
  const toggle = $('.menu-toggle');
  const label = $('.sr-only', toggle);

  const onScroll = () => headerEl.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setOpen = open => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? '메뉴 닫기' : '메뉴 열기';
    $('use', toggle).setAttribute('href', open ? '#i-close' : '#i-menu');
  };

  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', e => { if (e.matches) setOpen(false); });
})();

/* ---------- 설정값 반영 ---------- */
(function applyConfig() {
  if (CLINIC.hours) {
    $$('[data-bind="hours"]').forEach(el => { el.innerHTML = escapeHtml(CLINIC.hours).replace(/\n/g, '<br>'); });
  }
  if (CLINIC.parking) {
    $$('[data-bind="parking"]').forEach(el => { el.textContent = CLINIC.parking; });
  }
  if (CLINIC.smsNumber) {
    $$('[data-bind="smsDisplay"]').forEach(el => { el.textContent = CLINIC.smsNumber; });
  }
  if (CLINIC.email) {
    $$('[data-bind="emailDisplay"]').forEach(el => { el.textContent = CLINIC.email; });
  }

  // 문자·메일 카드와 하단 막대
  $$('[data-channel]').forEach(link => {
    const type = link.dataset.channel;
    const value = type === 'sms' ? CLINIC.smsNumber : CLINIC.email;
    if (value) {
      link.href = type === 'sms' ? smsHref(value) : mailHref(value, `[상담 문의] ${CLINIC.name}`);
    } else {
      link.classList.add('is-unset');
      link.addEventListener('click', e => {
        e.preventDefault();
        toast(type === 'sms'
          ? '문자 상담 번호를 준비하고 있습니다. 전화나 카카오톡으로 문의해 주세요.'
          : '상담 메일 주소를 준비하고 있습니다. 전화나 카카오톡으로 문의해 주세요.');
      });
      // 운영자가 로컬에서 볼 때만 "설정 필요" 표시
      const name = $('.channel-name', link);
      if (isLocal && name) {
        name.insertAdjacentHTML('beforeend', '<span class="config-badge">script.js 설정 필요</span>');
      }
    }
  });
})();

/* ---------- 고민별 안내 ---------- */
const selectedConcerns = new Set();

(function concerns() {
  const wrap = $('#concern-groups');
  const result = $('#concern-result');
  const jump = $('#concern-jump');
  if (!wrap || !result) return;
  const emptyHtml = result.innerHTML;

  // 묶음마다 고민 버튼을 그린다.
  $$('.concern-group', wrap).forEach(groupEl => {
    const items = CONCERNS.filter(c => c.group === groupEl.dataset.group);
    $('.cg-chips', groupEl).innerHTML = items.map(c => `
      <button type="button" class="concern-chip" aria-pressed="false" data-id="${c.id}">
        <span class="tick" aria-hidden="true"><svg class="icon"><use href="#i-check"/></svg></span>${escapeHtml(c.label)}
      </button>`).join('');
  });

  wrap.addEventListener('click', e => {
    const chip = e.target.closest('.concern-chip');
    if (!chip) return;
    const id = chip.dataset.id;
    const on = !selectedConcerns.has(id);
    if (on) selectedConcerns.add(id); else selectedConcerns.delete(id);
    chip.setAttribute('aria-pressed', String(on));
    const groupEl = chip.closest('.concern-group');
    groupEl.classList.toggle('has-picked', !!$('.concern-chip[aria-pressed="true"]', groupEl));
    render();
  });

  const unique = list => [...new Set(list)];
  const li = list => list.map(t => `<li>${escapeHtml(t)}</li>`).join('');

  function render() {
    const picked = CONCERNS.filter(c => selectedConcerns.has(c.id));
    jump.hidden = !picked.length;
    jump.textContent = `고른 고민 ${picked.length}개, 관련 검사 보기`;
    if (!picked.length) { result.innerHTML = emptyHtml; return; }

    const tests = unique(picked.flatMap(c => c.tests));
    const programs = unique(picked.flatMap(c => c.programs));
    const hasCheckup = selectedConcerns.has('checkup');

    result.innerHTML = `
      <h3 class="result-title">상담 때 함께 살펴볼 내용</h3>
      <div class="result-block"><h4>관련 검사</h4><ul>${li(tests)}</ul></div>
      <div class="result-block"><h4>도움이 될 수 있는 수업·상담</h4><ul>${li(programs)}</ul></div>
      <p class="result-note">${hasCheckup
        ? '정밀검사 후 보건소 지원 사업에 영수증을 청구할 수 있습니다. 필요한 검사는 초기상담에서 아이의 연령과 상황을 보고 정합니다.'
        : '필요한 검사는 초기상담에서 아이의 연령과 상황을 보고 정합니다. 위 목록은 상담 때 이야기해 볼 수 있는 예시입니다.'}</p>
      <div class="result-actions">
        <a class="btn btn-primary" href="#contact" data-apply-concerns>이 고민으로 상담 신청</a>
        <a class="btn btn-outline" href="${hasCheckup ? '#support' : '#tests'}">${hasCheckup ? '정밀검사 안내 보기' : '검사 자세히 보기'}</a>
      </div>`;
  }
})();

/* ---------- 둘러보기: 사진 크게 보기 ---------- */
(function gallery() {
  const box = $('#lightbox');
  const items = $$('#tour-gallery .tour-item');
  if (!box || !items.length || typeof box.showModal !== 'function') return;
  const image = $('#lightbox-img');
  const caption = $('#lightbox-caption');
  const count = $('#lightbox-count');
  let index = 0;
  let opener = null;

  const show = i => {
    index = (i + items.length) % items.length;
    const item = items[index];
    image.src = item.dataset.full;
    image.alt = $('img', item).alt;
    caption.textContent = item.dataset.caption;
    count.textContent = `${index + 1} / ${items.length}`;
  };

  items.forEach((item, i) => item.addEventListener('click', () => {
    opener = item;
    show(i);
    box.showModal();
  }));

  box.addEventListener('click', e => {
    const step = e.target.closest('[data-step]');
    if (step) { show(index + Number(step.dataset.step)); return; }
    if (e.target === box || e.target.closest('[data-close]')) box.close();
  });
  box.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
  box.addEventListener('close', () => { if (opener) opener.focus(); });
})();

/* ---------- 검사 안내: 좁은 화면에서는 묶음을 접어 둔다 ---------- */
(function tests() {
  const groups = $$('.test-group');
  if (!groups.length) return;
  const narrow = window.matchMedia('(max-width: 960px)');

  const apply = () => {
    groups.forEach((group, i) => {
      group.open = narrow.matches ? i === 0 : true;
      // 넓은 화면에서는 항상 펼쳐 두므로 제목이 초점을 받지 않게 한다.
      $('summary', group).tabIndex = narrow.matches ? 0 : -1;
    });
  };
  apply();
  narrow.addEventListener('change', apply);

  groups.forEach(group => {
    $('summary', group).addEventListener('click', e => { if (!narrow.matches) e.preventDefault(); });
  });
})();

/* ---------- 상담 신청서 ---------- */
const form = $('#consult-form');

function applyConcernsToForm(ids) {
  const picked = CONCERNS.filter(c => ids.includes(c.id));
  const areas = new Set(picked.map(c => c.area));
  $$('input[name="area"]', form).forEach(box => { if (areas.has(box.value)) box.checked = true; });
  if (ids.includes('checkup')) form.type.value = '영유아검진 정밀검사';
  const msg = form.message;
  if (!msg.value.trim() && picked.length) {
    msg.value = `걱정되는 점: ${picked.map(c => c.label).join(', ')}`;
    msg.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

function goToForm() {
  const reduce = reduceMotion();
  $('#contact').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  setTimeout(() => form.guardian.focus({ preventScroll: true }), reduce ? 0 : 600);
}

document.addEventListener('click', e => {
  const apply = e.target.closest('[data-apply-concerns]');
  const prefill = e.target.closest('[data-prefill-concern]');
  if (!apply && !prefill) return;
  e.preventDefault();
  const ids = apply ? [...selectedConcerns] : [prefill.dataset.prefillConcern];
  applyConcernsToForm(ids);
  goToForm();
  toast('고른 내용을 신청서에 옮겨 두었습니다.');
});

(function formHelpers() {
  if (!form) return;

  // 연락처 자동 하이픈
  form.phone.addEventListener('input', () => { form.phone.value = formatPhone(form.phone.value); });

  // 글자 수
  const count = $('#message-count span');
  form.message.addEventListener('input', () => { count.textContent = form.message.value.length; });

  // 입력하면 오류 표시 지우기
  form.addEventListener('input', e => {
    const field = e.target;
    if (field.getAttribute('aria-invalid') === 'true') setError(field, '');
    if (field.name === 'agreePrivacy' || field.name === 'agreeSensitive') $('#e-consent').textContent = '';
  });
  form.addEventListener('change', e => {
    if (e.target.name === 'age') setError(e.target, '');
  });

  // 보내기 버튼
  $$('[data-send]', form).forEach(btn => {
    btn.addEventListener('click', () => {
      if (!validate()) return;
      if (form.website.value) return; // 자동 입력 방지
      openSendDialog(btn.dataset.send);
    });
  });
})();

function formatPhone(value) {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.startsWith('02')) {
    if (d.length < 3) return d;
    if (d.length < 6) return `${d.slice(0, 2)}-${d.slice(2)}`;
    if (d.length < 10) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 10)}`;
  }
  if (d.length < 4) return d;
  if (d.length < 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length < 11) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

function setError(field, message) {
  const errorEl = $(`#e-${field.name}`);
  if (message) field.setAttribute('aria-invalid', 'true');
  else field.removeAttribute('aria-invalid');
  if (errorEl) errorEl.textContent = message;
}

function validate() {
  let firstInvalid = null;
  const mark = (field, msg) => { setError(field, msg); if (msg && !firstInvalid) firstInvalid = field; };

  mark(form.guardian, form.guardian.value.trim() ? '' : '보호자 성함을 적어 주세요.');

  const digits = form.phone.value.replace(/\D/g, '');
  const phoneOk = /^0\d{8,10}$/.test(digits);
  mark(form.phone, phoneOk ? '' : '연락받을 번호를 다시 확인해 주세요. 예: 010-1234-5678');

  mark(form.age, form.age.value ? '' : '아이 나이를 골라 주세요.');

  const consentOk = form.agreePrivacy.checked && form.agreeSensitive.checked;
  $('#e-consent').textContent = consentOk ? '' : '신청서를 보내려면 두 가지 동의에 모두 체크해 주세요.';
  if (!consentOk && !firstInvalid) firstInvalid = form.agreePrivacy.checked ? form.agreeSensitive : form.agreePrivacy;

  if (firstInvalid) {
    firstInvalid.focus();
    toast('신청서에서 빠진 부분을 확인해 주세요.');
    return false;
  }
  return true;
}

function collect() {
  return {
    guardian: form.guardian.value.trim(),
    phone: form.phone.value.trim(),
    age: form.age.value,
    type: form.type.value,
    areas: $$('input[name="area"]:checked', form).map(b => b.value).join(', '),
    time: (form.querySelector('input[name="time"]:checked') || {}).value || '언제든',
    message: form.message.value.trim()
  };
}

function composeMessage(d) {
  const lines = [
    `[${CLINIC.name} 상담 신청]`,
    `보호자: ${d.guardian}`,
    `연락처: ${d.phone}`,
    `아이 나이: ${d.age}`,
    `상담 종류: ${d.type}`,
    `걱정되는 부분: ${d.areas || '선택 안 함'}`,
    `연락 편한 시간: ${d.time}`
  ];
  if (d.message) lines.push('', '남기신 말씀:', d.message);
  lines.push('', '(홈페이지 상담 신청서에서 작성)');
  return lines.join('\n');
}

/* ---------- 보내기 전 확인 창 ---------- */
const dialog = $('#send-dialog');

function actionLink({ label, href, cls = 'btn-primary', icon, external = false }) {
  const a = document.createElement('a');
  a.className = `btn ${cls}`;
  a.href = href;
  if (external) { a.target = '_blank'; a.rel = 'noopener'; }
  a.innerHTML = `${icon ? `<svg class="icon${icon === 'i-kakao' ? ' icon-fill' : ''}" aria-hidden="true"><use href="#${icon}"/></svg>` : ''}${escapeHtml(label)}`;
  return a;
}

function actionButton({ label, onClick, cls = 'btn-outline', icon }) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `btn ${cls}`;
  b.innerHTML = `${icon ? `<svg class="icon" aria-hidden="true"><use href="#${icon}"/></svg>` : ''}${escapeHtml(label)}`;
  b.addEventListener('click', onClick);
  return b;
}

function setStatus(message, isError = false) {
  const el = $('#send-dialog-status');
  el.textContent = message;
  el.classList.toggle('is-error', isError);
}

async function openSendDialog(channel) {
  const data = collect();
  const text = composeMessage(data);
  const title = $('#send-dialog-title');
  const guide = $('#send-dialog-guide');
  const actions = $('#send-dialog-actions');
  $('#send-preview').value = text;
  actions.innerHTML = '';
  setStatus('');

  const copyBtn = (label = '내용 복사') => actionButton({
    label, icon: 'i-copy',
    onClick: async () => setStatus(await copyText(text) ? '내용을 복사했습니다.' : '복사하지 못했습니다. 위 내용을 길게 눌러 직접 복사해 주세요.')
  });
  const fallback = () => {
    actions.append(
      actionLink({ label: `전화하기 ${CLINIC.phone}`, href: `tel:${CLINIC.phone}`, icon: 'i-phone' }),
      actionLink({ label: '카카오톡 채팅 열기', href: CLINIC.kakaoChat, cls: 'btn-kakao', icon: 'i-kakao', external: true })
    );
  };

  if (channel === 'kakao') {
    title.textContent = '카카오톡으로 보내기';
    guide.textContent = '아래 내용을 복사해 두었습니다. 카카오톡 채팅창이 열리면 입력창에 붙여넣기 한 뒤 보내 주세요.';
    actions.append(
      actionLink({ label: '카카오톡 채팅 열기', href: CLINIC.kakaoChat, cls: 'btn-kakao', icon: 'i-kakao', external: true }),
      copyBtn('내용 다시 복사')
    );
    dialog.showModal();
    const ok = await copyText(text);
    setStatus(ok ? '내용을 복사했습니다.' : '자동 복사가 되지 않았습니다. 위 내용을 길게 눌러 복사해 주세요.', !ok);
    return;
  }

  if (channel === 'sms') {
    title.textContent = '문자로 보내기';
    if (!CLINIC.smsNumber) {
      guide.textContent = '문자 상담 번호를 준비하고 있습니다. 같은 내용을 전화나 카카오톡으로 전해 주세요.';
      fallback();
      actions.append(copyBtn());
    } else if (isMobile) {
      guide.textContent = `문자 앱이 열리면 받는 사람(${noBreak(CLINIC.smsNumber)})과 내용을 확인한 뒤 보내 주세요.`;
      actions.append(actionLink({ label: '문자 앱 열기', href: smsHref(CLINIC.smsNumber, text), icon: 'i-sms' }), copyBtn());
    } else {
      guide.textContent = `컴퓨터에서는 문자를 보낼 수 없습니다. 휴대폰 문자로 아래 내용을 보내 주세요. 받는 번호: ${noBreak(CLINIC.smsNumber)}`;
      actions.append(
        actionButton({ label: '번호 복사', icon: 'i-copy', cls: 'btn-primary',
          onClick: async () => setStatus(await copyText(CLINIC.smsNumber) ? '번호를 복사했습니다.' : '복사하지 못했습니다.') }),
        copyBtn()
      );
    }
    dialog.showModal();
    return;
  }

  if (channel === 'mail') {
    title.textContent = '이메일로 보내기';
    const subject = `[상담 신청] ${data.guardian} 보호자님 (${data.age})`;

    if (CLINIC.appsScriptUrl) {
      guide.textContent = '아래 내용을 클리닉 메일로 바로 보냅니다.';
      const sendBtn = actionButton({
        label: '이 내용으로 보내기', icon: 'i-mail', cls: 'btn-primary',
        onClick: async () => {
          sendBtn.disabled = true;
          setStatus('보내는 중입니다…');
          try {
            await fetch(CLINIC.appsScriptUrl, {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
              body: new URLSearchParams({ ...data, subject, website: form.website.value })
            });
            setStatus('보냈습니다. 확인한 뒤 연락드리겠습니다.');
            sendBtn.remove();
            form.reset();
            $('#message-count span').textContent = '0';
          } catch (err) {
            sendBtn.disabled = false;
            setStatus('보내지 못했습니다. 인터넷 연결을 확인하거나 전화·카카오톡으로 문의해 주세요.', true);
          }
        }
      });
      actions.append(sendBtn);
    } else if (CLINIC.email) {
      guide.textContent = `메일 앱이 열리면 받는 사람(${CLINIC.email})과 내용을 확인한 뒤 보내 주세요. 메일 앱이 열리지 않으면 주소와 내용을 복사해 직접 보내 주세요.`;
      actions.append(
        actionLink({ label: '메일 앱 열기', href: mailHref(CLINIC.email, subject, text), icon: 'i-mail' }),
        actionButton({ label: '메일 주소 복사', icon: 'i-copy',
          onClick: async () => setStatus(await copyText(CLINIC.email) ? '메일 주소를 복사했습니다.' : '복사하지 못했습니다.') }),
        copyBtn()
      );
    } else {
      guide.textContent = '상담 메일 주소를 준비하고 있습니다. 같은 내용을 전화나 카카오톡으로 전해 주세요.';
      fallback();
      actions.append(copyBtn());
    }
    dialog.showModal();
  }
}

// 창 바깥(배경)을 누르면 닫기
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

/* ---------- 호스팅 배지: 있으면 하단 연락 막대를 배지 위로 올림 ---------- */
(function hostBadge() {
  const mark = () => {
    const has = !!document.getElementById('nl-badge-frame');
    document.body.classList.toggle('has-host-badge', has);
    return has;
  };
  if (mark()) return;
  const watch = new MutationObserver(() => { if (mark()) watch.disconnect(); });
  watch.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => watch.disconnect(), 15000);
})();

/* ---------- 주소 복사 ---------- */
document.addEventListener('click', async e => {
  const btn = e.target.closest('[data-copy]');
  if (!btn) return;
  toast(await copyText(btn.dataset.copy) ? '주소를 복사했습니다.' : '복사하지 못했습니다. 주소를 길게 눌러 복사해 주세요.');
});
