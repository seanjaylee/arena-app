// Supabase 공개(public) 접속 정보.
//
// 이 두 값은 원래 브라우저에 노출되도록 설계된 "공개용" 값입니다.
// - anon key는 배포된 사이트를 여는 모든 방문자의 클라이언트 코드에 이미 포함됩니다.
// - 실제 데이터 보호는 DB의 RLS(행 수준 보안) 정책이 담당합니다.
// - 절대 노출되면 안 되는 service_role 키는 이 프로젝트 어디에도 없습니다.
//
// 배포 환경(Vercel 등)의 환경변수가 잘못된 값으로 설정돼 있어도 흔들리지 않도록,
// 검증된 올바른 값을 코드에 직접 고정합니다.
// (다른 Supabase 프로젝트로 옮길 땐 아래 두 값만 교체하면 됩니다.)

export const SUPABASE_URL = "https://jxotqiqljhtnxistnkva.supabase.co";

export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4b3RxaXFsamh0bnhpc3Rua3ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MDg0MzksImV4cCI6MjEwMDM4NDQzOX0.IMrxtPmGX5Vl7mRB-0IRs3Dq76kSqKke6SQ4gc2WupM";
