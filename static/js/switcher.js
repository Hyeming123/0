// 발표 시연을 위한 계정 및 데이터 퀵 스위처 위젯
import { loginUser, registerUser, getCurrentUser, logoutUser, chargeCredits, initDB } from './db.js';

export function renderDemoSwitcher() {
  const container = document.getElementById('demoSwitcherContainer');
  if (!container) return;

  // 위젯 기본 HTML 구조 삽입
  container.innerHTML = `
    <div class="demo-switcher-widget">
      <h6>시연 퀵 제어판 <button class="btn btn-sm btn-outline-light p-0 px-1 border-0" id="hideSwitcherBtn" style="font-size: 10px;">닫기</button></h6>
      <div id="switcherContent">
        <div class="mb-2">
          <label class="text-warning fw-bold mb-1 d-block" style="font-size: 10px;">사용자 계정 퀵 로그인</label>
          <button class="btn btn-sm btn-primary w-100 mb-1 py-1" id="loginAsCompanyBtn">한빛정밀 (기업)</button>
          <button class="btn btn-sm btn-success w-100 py-1" id="loginAsBuyerBtn">글로벌 바이어 (바이어)</button>
        </div>
        <div class="mt-2 pt-2 border-top">
          <label class="text-warning fw-bold mb-1 d-block" style="font-size: 10px;">디바이스/데이터 제어</label>
          <div class="row g-1">
            <div class="col-6">
              <button class="btn btn-sm btn-outline-warning w-100 py-1" id="chargeCreditsBtn" style="font-size: 9px;">크레딧 충전</button>
            </div>
            <div class="col-6">
              <button class="btn btn-sm btn-outline-danger w-100 py-1" id="resetDataBtn" style="font-size: 9px;">DB 초기화</button>
            </div>
          </div>
        </div>
      </div>
      <div id="switcherCollapsed" style="display: none; text-align: center;">
        <button class="btn btn-sm btn-outline-warning w-100 py-0" id="showSwitcherBtn" style="font-size: 10px;">제어판 열기</button>
      </div>
    </div>
  `;

  // 이벤트 리스너 등록
  const hideBtn = document.getElementById('hideSwitcherBtn');
  const showBtn = document.getElementById('showSwitcherBtn');
  const content = document.getElementById('switcherContent');
  const collapsed = document.getElementById('switcherCollapsed');

  hideBtn.addEventListener('click', () => {
    content.style.display = 'none';
    hideBtn.style.display = 'none';
    collapsed.style.display = 'block';
  });

  showBtn.addEventListener('click', () => {
    content.style.display = 'block';
    hideBtn.style.display = 'inline-block';
    collapsed.style.display = 'none';
  });

  // 1. 기업 계정 로그인
  document.getElementById('loginAsCompanyBtn').addEventListener('click', () => {
    try {
      loginUser('hanbit@company.com', 'password');
      alert('한빛정밀(기업) 계정으로 퀵 로그인되었습니다.');
      // 대시보드로 이동
      window.location.href = 'dashboard_company.html';
    } catch (e) {
      // 계정이 없을 경우를 대비해 DB 초기화 후 재시도
      initDB();
      loginUser('hanbit@company.com', 'password');
      window.location.href = 'dashboard_company.html';
    }
  });

  // 2. 바이어 계정 로그인
  document.getElementById('loginAsBuyerBtn').addEventListener('click', () => {
    const buyerEmail = 'buyer@global.com';
    try {
      loginUser(buyerEmail, 'password');
      alert('글로벌 바이어 계정으로 퀵 로그인되었습니다.');
      window.location.href = 'marketplace.html';
    } catch (e) {
      // 바이어 계정이 없으면 자동 회원가입 처리
      registerUser(buyerEmail, 'password', 'buyer', 'EuroTrade GmbH', 'DE-987654321');
      alert('신규 글로벌 바이어 계정을 자동 생성 및 로그인했습니다.');
      window.location.href = 'marketplace.html';
    }
  });

  // 3. 크레딧 충전 (+50)
  document.getElementById('chargeCreditsBtn').addEventListener('click', () => {
    const user = getCurrentUser();
    if (!user) {
      alert('로그인한 사용자가 없습니다. 먼저 퀵 로그인을 해주세요.');
      return;
    }
    chargeCredits(user.email, 50);
    alert(`크레딧 50 CR이 충전되었습니다. (보유: ${getCurrentUser().credits} CR)`);
    window.location.reload();
  });

  // 4. DB 전체 초기화
  document.getElementById('resetDataBtn').addEventListener('click', () => {
    if (confirm('모든 로컬 저장소 데이터를 초기화하고 기본 세팅으로 리셋하시겠습니까?')) {
      localStorage.clear();
      initDB();
      alert('로컬 데이터베이스가 초기화되었습니다. 기본 데이터(한빛정밀)가 재구축되었습니다.');
      window.location.href = 'index.html';
    }
  });
}
