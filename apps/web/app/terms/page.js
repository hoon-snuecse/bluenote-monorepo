export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-8">이용약관</h1>
      
      <div className="prose prose-invert max-w-none space-y-6 text-slate-300">
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">제1조 (목적)</h2>
          <p>본 약관은 BlueNote Atelier(이하 "서비스")가 제공하는 교육 및 연구 관련 서비스의 이용조건 및 절차, 
          이용자와 서비스 제공자의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">제2조 (이용계약의 성립)</h2>
          <p>이용계약은 이용자가 본 약관에 동의하고 서비스 이용 신청을 한 후, 
          서비스 제공자가 이를 승낙함으로써 성립합니다.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">제3조 (서비스의 내용)</h2>
          <p>서비스는 다음과 같은 내용을 제공합니다:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>교육 콘텐츠 열람 및 다운로드</li>
            <li>연구 자료 공유 및 협업</li>
            <li>AI 기반 교육 도우미 (Claude) 이용</li>
            <li>개인화된 학습 관리</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">제4조 (이용자의 의무)</h2>
          <p>이용자는 다음 행위를 하여서는 안 됩니다:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>타인의 정보를 도용하거나 허위정보를 입력하는 행위</li>
            <li>서비스의 정보를 변경하거나 서비스를 악용하는 행위</li>
            <li>저작권 등 지적재산권을 침해하는 행위</li>
            <li>서비스의 안정적 운영을 방해하는 행위</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">제5조 (서비스 이용의 제한)</h2>
          <p>서비스 제공자는 이용자가 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 
          서비스 이용을 제한하거나 계약을 해지할 수 있습니다.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">제6조 (저작권의 귀속)</h2>
          <p>서비스에 게시된 콘텐츠의 저작권은 해당 저작자에게 귀속됩니다. 
          단, 서비스는 게시된 콘텐츠를 서비스 내에서 사용할 수 있는 권리를 가집니다.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">제7조 (개인정보보호)</h2>
          <p>서비스는 이용자의 개인정보를 보호하기 위해 노력하며, 
          개인정보 처리에 관한 사항은 별도의 개인정보처리방침에 따릅니다.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">제8조 (면책조항)</h2>
          <p>서비스는 천재지변, 전쟁 및 기타 불가항력적인 사유로 인하여 서비스를 제공할 수 없는 경우에는 
          서비스 제공에 대한 책임이 면제됩니다.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">제9조 (분쟁의 해결)</h2>
          <p>본 약관과 관련하여 발생한 분쟁은 대한민국 법률에 따라 해결합니다.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">제10조 (약관의 개정)</h2>
          <p>서비스 제공자는 필요한 경우 본 약관을 개정할 수 있으며, 
          개정된 약관은 서비스 내 공지사항을 통해 공지합니다.</p>
        </section>

        <section className="border-t border-slate-700 pt-6">
          <p className="text-sm">
            <strong>시행일</strong>: 이 약관은 2025년 1월 20일부터 시행됩니다.
          </p>
          <p className="text-sm mt-2">
            <strong>문의</strong>: 약관에 대한 문의사항은 hoon@snuecse.org로 연락 주시기 바랍니다.
          </p>
        </section>
      </div>
    </div>
  );
}