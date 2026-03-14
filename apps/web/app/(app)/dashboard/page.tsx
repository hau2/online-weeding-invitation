import { logoutAction } from '@/lib/auth'

export default function DashboardPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Bảng điều khiển</h1>
      <p className="text-gray-500 mb-6">Thiệp cưới của bạn sẽ xuất hiện ở đây.</p>
      <form action={logoutAction}>
        <button type="submit" className="text-rose-600 hover:underline text-sm">
          Đăng xuất
        </button>
      </form>
    </main>
  )
}
