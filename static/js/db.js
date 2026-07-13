// HERMA-X LocalStorage Mock Backend Database
// 이 파일은 백엔드 데이터베이스와 비즈니스 로직을 브라우저의 localStorage로 시뮬레이션합니다.

const STORAGE_KEYS = {
  USERS: 'HERMAX_USERS',
  PRODUCTS: 'HERMAX_PRODUCTS',
  INQUIRIES: 'HERMAX_INQUIRIES',
  AUDIT_LOGS: 'HERMAX_AUDIT_LOGS',
  NOTIFICATIONS: 'HERMAX_NOTIFICATIONS',
  CURRENT_USER: 'HERMAX_CURRENT_USER'
};

// 데이터 조회 유틸리티
function getStorage(key, defaultVal = []) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  } catch (e) {
    console.error(`LocalStorage Read Error (${key}):`, e);
    return defaultVal;
  }
}

// 데이터 저장 유틸리티
function setStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`LocalStorage Write Error (${key}):`, e);
  }
}

// 기본 DB 초기화 및 시연용 데이터 시딩 (한빛정밀)
export function initDB() {
  const users = getStorage(STORAGE_KEYS.USERS);
  const products = getStorage(STORAGE_KEYS.PRODUCTS);

  // 시연 기업 계정 이메일
  const demoEmail = 'hanbit@company.com';

  // 1. 시연 기업 사용자 생성
  if (!users.some(u => u.email === demoEmail)) {
    users.push({
      email: demoEmail,
      companyName: '한빛정밀',
      role: 'company',
      businessNumber: '123-45-67890',
      country: '대한민국',
      credits: 100,
      profile: {
        companyName: '한빛정밀',
        businessType: '자동차 부품 제조업',
        mainItems: '자동차용 철강 브라켓, 기어박스 하우징',
        targetCountries: '독일, 프랑스, 미국',
        certificates: 'ISO9001, IATF16949',
        introduction: '한빛정밀은 20년 경력의 자동차 정밀 부품 전문 제조 기업입니다. 엄격한 품질 관리(ISO9001) 시스템을 통해 글로벌 완성차 공급망에 신뢰도 높은 브라켓류를 공급하고 있습니다. 유럽 탄소국경조정제도(CBAM) 대응을 위해 탄소 배출량 산정을 준비 중에 있습니다.'
      }
    });
    setStorage(STORAGE_KEYS.USERS, users);
    addAuditLog(demoEmail, '기업 계정 생성', '한빛정밀 기업 계정이 기본 등록되었습니다.');
  }

  // 2. 시연 상품 및 디지털 상품 여권 생성
  const demoProductId = 'demo-bracket-001';
  if (!products.some(p => p.id === demoProductId)) {
    const newProduct = {
      id: demoProductId,
      ownerEmail: demoEmail,
      productName: '자동차용 철강 브라켓 (Steel Bracket)',
      hsCode: '8708.29',
      origin: '대한민국 (South Korea)',
      exportCountries: '독일',
      description: '고장력 탄소강을 정밀 프레스 공정으로 가동한 자동차 섀시 체결용 브라켓입니다. 내식성을 높이기 위해 카티온 전착 도장 마감이 적용되었습니다.',
      imageUrl: 'https://placehold.co/400x300/101f35/e5c07b?text=Steel+Bracket',
      documents: {
        originCert: { uploaded: true, filename: 'FTA_원산지증명서_한빛.pdf' },
        qualityCert: { uploaded: true, filename: 'ISO9001_인증서_한빛정밀.pdf' },
        carbonData: { uploaded: false, filename: '' }, // 탄소자료 준비 중
        testReport: { uploaded: true, filename: '시험성적서_MS_BRKT_01.pdf' },
        invoicePacking: { uploaded: true, filename: 'Commercial_Invoice_PackList.pdf' }
      },
      securitySetting: {
        level: 'restricted', // 제한 공개 여권
        period: '2026-12-31',
        allowDownload: false
      },
      readiness: {
        grade: 'B',
        score: 80,
        risk: '중간 (Medium)',
        details: {
          missingInfo: [],
          missingDocs: ['탄소자료 (Carbon Data) 누락 - 준비 중 상태'],
          riskLevel: '중간'
        }
      },
      createdAt: new Date().toISOString()
    };
    products.push(newProduct);
    setStorage(STORAGE_KEYS.PRODUCTS, products);
    addAuditLog(demoEmail, '상품 등록 및 여권 발행', '자동차용 철강 브라켓 상품 여권이 시연용으로 등록되었습니다.');
  }
}

// 회원가입 및 로그인 처리
export function registerUser(email, password, role = 'company', companyName = '', businessNumber = '', country = '') {
  const users = getStorage(STORAGE_KEYS.USERS);
  if (users.some(u => u.email === email)) {
    throw new Error('이미 등록된 이메일 주소입니다.');
  }

  const newUser = {
    email,
    role, // 'company' 또는 'buyer'
    companyName: companyName || (role === 'buyer' ? '가상 바이어' : '가상 기업'),
    businessNumber,
    country: country || '',
    credits: 100, // 기본 크레딧 지급
    profile: {
      companyName: companyName || '',
      businessType: '',
      mainItems: '',
      targetCountries: '',
      certificates: '',
      introduction: ''
    }
  };

  users.push(newUser);
  setStorage(STORAGE_KEYS.USERS, users);

  // 첫 로그인 상태로 설정
  setCurrentUser(newUser);
  addAuditLog(email, '회원 가입', `${role === 'company' ? '기업' : '바이어'} 계정이 성공적으로 가입되었습니다.`);
  return newUser;
}

export function loginUser(email, password) {
  const users = getStorage(STORAGE_KEYS.USERS);
  const user = users.find(u => u.email === email);
  if (!user) {
    throw new Error('계정을 찾을 수 없습니다. (시연용으로 가상 가입 후 시도 가능)');
  }
  setCurrentUser(user);
  addAuditLog(email, '로그인', '로그인 세션이 활성화되었습니다.');
  return user;
}

export function getCurrentUser() {
  return getStorage(STORAGE_KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user) {
  setStorage(STORAGE_KEYS.CURRENT_USER, user);
}

export function logoutUser() {
  const user = getCurrentUser();
  if (user) {
    addAuditLog(user.email, '로그아웃', '사용자 로그아웃 처리되었습니다.');
  }
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// 기업 정보 수정
export function updateCompanyProfile(email, profile) {
  const users = getStorage(STORAGE_KEYS.USERS);
  const userIdx = users.findIndex(u => u.email === email);
  if (userIdx === -1) throw new Error('사용자를 찾을 수 없습니다.');

  users[userIdx].profile = { ...users[userIdx].profile, ...profile };
  users[userIdx].companyName = profile.companyName || users[userIdx].companyName;
  setStorage(STORAGE_KEYS.USERS, users);

  // 세션 업데이트
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.email === email) {
    currentUser.profile = users[userIdx].profile;
    currentUser.companyName = users[userIdx].companyName;
    setCurrentUser(currentUser);
  }

  addAuditLog(email, '기업 프로필 수정', '회사명, 보유 인증 등 기업 정보를 업데이트했습니다.');
  return users[userIdx];
}

// 크레딧 차감
export function deductCredits(email, amount, actionName) {
  const users = getStorage(STORAGE_KEYS.USERS);
  const userIdx = users.findIndex(u => u.email === email);
  if (userIdx === -1) throw new Error('사용자를 찾을 수 없습니다.');

  if (users[userIdx].credits < amount) {
    throw new Error(`크레딧이 부족합니다. (필요: ${amount} 크레딧, 보유: ${users[userIdx].credits} 크레딧)`);
  }

  users[userIdx].credits -= amount;
  setStorage(STORAGE_KEYS.USERS, users);

  // 세션 업데이트
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.email === email) {
    currentUser.credits = users[userIdx].credits;
    setCurrentUser(currentUser);
  }

  addAuditLog(email, '크레딧 차감', `[${actionName}] 사유로 ${amount} 크레딧이 차감되었습니다. (잔여: ${users[userIdx].credits})`);
  return users[userIdx].credits;
}

// 크레딧 충전 (시연 테스트용 편의 기능)
export function chargeCredits(email, amount) {
  const users = getStorage(STORAGE_KEYS.USERS);
  const userIdx = users.findIndex(u => u.email === email);
  if (userIdx === -1) throw new Error('사용자를 찾을 수 없습니다.');

  users[userIdx].credits += amount;
  setStorage(STORAGE_KEYS.USERS, users);

  const currentUser = getCurrentUser();
  if (currentUser && currentUser.email === email) {
    currentUser.credits = users[userIdx].credits;
    setCurrentUser(currentUser);
  }

  addAuditLog(email, '크레딧 충전', `시연용 크레딧 ${amount}가 충전되었습니다.`);
  return users[userIdx].credits;
}

// 감사 로그 기록
export function addAuditLog(email, action, details) {
  const logs = getStorage(STORAGE_KEYS.AUDIT_LOGS);
  const newLog = {
    id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    email,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog); // 최신 로그가 맨 위로 오도록 함
  setStorage(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 100)); // 최대 100개 로그 보관
}

export function getAuditLogs(email) {
  const logs = getStorage(STORAGE_KEYS.AUDIT_LOGS);
  return logs.filter(log => log.email === email);
}

// 수출 준비도 등급 점검 계산
export function calcExportReadiness(product) {
  const missingInfo = [];
  const missingDocs = [];

  // 필수 정보 체크
  if (!product.productName) missingInfo.push('상품명');
  if (!product.hsCode) missingInfo.push('HS코드');
  if (!product.origin) missingInfo.push('원산지');
  if (!product.exportCountries) missingInfo.push('수출 가능 국가');
  if (!product.description) missingInfo.push('상품 설명');

  // 서류 업로드 체크
  const docs = product.documents || {};
  if (!docs.originCert?.uploaded) missingDocs.push('원산지증명서 (Origin Certificate)');
  if (!docs.qualityCert?.uploaded) missingDocs.push('품질 인증서 (Quality Certificate)');
  if (!docs.carbonData?.uploaded) missingDocs.push('탄소자료 (Carbon/CBAM Data)');
  if (!docs.testReport?.uploaded) missingDocs.push('시험성적서 (Test Report)');
  if (!docs.invoicePacking?.uploaded) missingDocs.push('인보이스/패킹리스트 (Invoice/Packing List)');

  let grade = 'A';
  let score = 100;
  let risk = '낮음 (Low)';

  if (missingInfo.length > 0) {
    grade = 'C';
    score = 40;
    risk = '높음 (High)';
  } else if (missingDocs.length > 0) {
    // 누락된 서류 개수에 따라 등급 차등
    const missingDocsCount = missingDocs.length;
    if (missingDocs.some(d => d.includes('원산지증명서') || d.includes('품질 인증서'))) {
      // 핵심 서류가 누락된 경우
      grade = 'C';
      score = 50;
      risk = '높음 (High)';
    } else {
      grade = 'B';
      score = 100 - (missingDocsCount * 10);
      risk = '중간 (Medium)';
    }
  }

  return {
    grade,
    score,
    risk,
    details: {
      missingInfo,
      missingDocs,
      riskLevel: risk.split(' ')[0]
    }
  };
}

// 상품 및 여권 생성/수정/조회
export function getProducts() {
  return getStorage(STORAGE_KEYS.PRODUCTS);
}

export function getProduct(id) {
  const products = getProducts();
  return products.find(p => p.id === id) || null;
}

export function saveProduct(productData, email) {
  const products = getProducts();
  const isNew = !productData.id;
  const productId = isNew ? 'prod-' + Date.now() : productData.id;

  // 등급 계산
  const readiness = calcExportReadiness(productData);

  const updatedProduct = {
    ...productData,
    id: productId,
    ownerEmail: email,
    readiness,
    createdAt: productData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isNew) {
    products.push(updatedProduct);
  } else {
    const idx = products.findIndex(p => p.id === productId);
    if (idx !== -1) {
      products[idx] = updatedProduct;
    }
  }

  setStorage(STORAGE_KEYS.PRODUCTS, products);
  addAuditLog(email, isNew ? '상품 등록' : '상품 여권 수정', `상품 [${productData.productName}]의 정보 및 여권을 업데이트했습니다. 등급: ${readiness.grade}`);
  return updatedProduct;
}

// 바이어 문의 처리
export function sendInquiry(inquiryData) {
  const inquiries = getStorage(STORAGE_KEYS.INQUIRIES);
  const newInquiry = {
    id: 'inq-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    ...inquiryData,
    status: 'pending', // 'pending' | 'approved' | 'rejected'
    timestamp: new Date().toISOString()
  };
  inquiries.unshift(newInquiry);
  setStorage(STORAGE_KEYS.INQUIRIES, inquiries);

  // 알림 전송
  const product = getProduct(inquiryData.productId);
  if (product) {
    createNotification(
      product.ownerEmail,
      `[새 바이어 문의] 바이어(${inquiryData.buyerEmail})가 [${product.productName}] 상품에 대해 거래 문의 및 서류 열람 권한을 요청했습니다.`,
      'inquiry',
      'dashboard_company.html'
    );
    // 판매자 감사 로그에도 기록 추가! (발표 시연 시 대시보드에서 보임)
    addAuditLog(product.ownerEmail, '바이어 문의 수신', `바이어 [${inquiryData.buyerEmail}]로부터 [${product.productName}] 상품에 대한 거래 문의 및 서류 권한 요청을 수신했습니다.`);
  }

  addAuditLog(inquiryData.buyerEmail, '바이어 거래 문의 발송', `상품 [${product?.productName || '알 수 없음'}]에 거래 문의를 전송했습니다.`);
  return newInquiry;
}

export function getInquiriesForCompany(email) {
  const inquiries = getStorage(STORAGE_KEYS.INQUIRIES);
  const products = getProducts().filter(p => p.ownerEmail === email);
  const productIds = products.map(p => p.id);
  return inquiries.filter(inq => productIds.includes(inq.productId));
}

export function approveInquiry(inquiryId, companyEmail) {
  const inquiries = getStorage(STORAGE_KEYS.INQUIRIES);
  const inqIdx = inquiries.findIndex(inq => inq.id === inquiryId);
  if (inqIdx === -1) throw new Error('문의 건을 찾을 수 없습니다.');

  const inquiry = inquiries[inqIdx];
  const product = getProduct(inquiry.productId);
  if (!product || product.ownerEmail !== companyEmail) {
    throw new Error('이 상품에 대한 승인 권한이 없습니다.');
  }

  // 크레딧 차감 (제한 공개 승인 시 크레딧 차감 -8)
  deductCredits(companyEmail, 8, `제한 공개 서류 승인 - ${inquiry.buyerEmail}`);

  inquiries[inqIdx].status = 'approved';
  setStorage(STORAGE_KEYS.INQUIRIES, inquiries);

  // 감사로그 등록
  addAuditLog(companyEmail, '제한 공개 승인', `바이어 [${inquiry.buyerEmail}]에게 [${product.productName}]의 비공개 서류 열람을 승인했습니다.`);

  // 바이어를 위한 알림 추가
  createNotification(
    inquiry.buyerEmail,
    `[서류 요청 승인] [${product.productName}] 판매자가 제한 공개 서류 열람 요청을 승인했습니다.`,
    'approval',
    `product_detail.html?id=${product.id}`
  );

  return inquiries[inqIdx];
}

// 알림 기능
export function createNotification(receiverEmail, message, type, link = '#') {
  const notifications = getStorage(STORAGE_KEYS.NOTIFICATIONS);
  const newNotif = {
    id: 'notif-' + Date.now(),
    receiverEmail,
    message,
    type,
    link,
    read: false,
    timestamp: new Date().toISOString()
  };
  notifications.unshift(newNotif);
  setStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
}

export function getNotifications(email) {
  const notifications = getStorage(STORAGE_KEYS.NOTIFICATIONS);
  return notifications.filter(n => n.receiverEmail === email);
}

export function markNotificationsAsRead(email) {
  const notifications = getStorage(STORAGE_KEYS.NOTIFICATIONS);
  const updated = notifications.map(n => n.receiverEmail === email ? { ...n, read: true } : n);
  setStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
}
