export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-8">개인정보처리방침</h1>
      
      <div className="prose prose-invert max-w-none space-y-6 text-slate-300">
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">1. 개인정보의 수집 및 이용 목적</h2>
          <p>BlueNote Atelier는 다음의 목적을 위해 개인정보를 수집 및 이용합니다:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>회원 가입 및 관리</li>
            <li>서비스 제공 및 운영</li>
            <li>교육 콘텐츠 및 연구 자료 제공</li>
            <li>서비스 개선 및 신규 서비스 개발</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">2. 수집하는 개인정보 항목</h2>
          <p>수집하는 개인정보는 다음과 같습니다:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>필수항목</strong>: 이메일 주소, 이름 (Google 계정 정보)</li>
            <li><strong>자동수집항목</strong>: 접속 IP, 접속 시간, 서비스 이용 기록</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">3. 개인정보의 보유 및 이용 기간</h2>
          <p>개인정보는 수집 및 이용 목적이 달성될 때까지 보유하며, 회원 탈퇴 시 즉시 파기합니다. 
          단, 관련 법령에 따라 보존할 필요가 있는 경우에는 해당 기간 동안 보존합니다.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">4. 개인정보의 제3자 제공</h2>
          <p>BlueNote Atelier는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 
          다만, 다음의 경우에는 예외로 합니다:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의한 경우</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">5. 개인정보의 안전성 확보 조치</h2>
          <p>개인정보 보호를 위해 다음과 같은 조치를 취하고 있습니다:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>개인정보의 암호화</li>
            <li>해킹 등에 대비한 기술적 대책</li>
            <li>개인정보 접근 권한 제한</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">6. 이용자의 권리</h2>
          <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>개인정보 열람 요구</li>
            <li>개인정보 정정·삭제 요구</li>
            <li>개인정보 처리 정지 요구</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">7. 개인정보 보호책임자</h2>
          <p>개인정보 보호 관련 문의사항은 아래로 연락 주시기 바랍니다:</p>
          <div className="ml-6 mt-2">
            <p>이메일: hoon@snuecse.org</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">8. 개인정보처리방침의 변경</h2>
          <p>이 개인정보처리방침은 2025년 1월 20일부터 적용됩니다.</p>
        </section>
      </div>
    </div>
  );
}