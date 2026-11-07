// Skeleton สำหรับแสดงระหว่างโหลดข้อมูล (แทน spinner)
// ใช้กล่องสีเทากะพริบ วางโครงให้เหมือนหน้าจริง ผู้ใช้จะเห็นว่ากำลังโหลดอะไรอยู่

function Bar({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

export function ListRowsSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-t border-gray-200 px-4 py-4 first:border-t-0">
          <Bar className="h-4 w-16" />
          <Bar className="h-4 flex-1" />
          <Bar className="hidden h-4 w-28 md:block" />
          <Bar className="hidden h-4 w-36 md:block" />
          <Bar className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 text-gray-900 sm:p-6" aria-busy="true">
      <p className="sr-only">กำลังโหลดรายการภารกิจ</p>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <Bar className="h-8 w-40" />
          <Bar className="h-10 w-40" />
        </div>
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
          <Bar className="mb-4 h-10 w-full" />
          <Bar className="h-10 w-full" />
        </div>
        <Bar className="mb-2 h-4 w-24" />
        <ListRowsSkeleton />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 text-gray-900 sm:p-6" aria-busy="true">
      <p className="sr-only">กำลังโหลดรายละเอียดภารกิจ</p>
      <div className="mx-auto max-w-6xl" aria-hidden>
        <Bar className="mb-4 h-4 w-40" />
        <Bar className="mb-6 h-8 w-2/3" />
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
          <Bar className="mb-4 h-6 w-32" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <Bar className="mb-2 h-3 w-20" />
                <Bar className="h-5 w-32" />
              </div>
            ))}
          </div>
        </div>
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
          <Bar className="mb-4 h-6 w-40" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Bar className="h-80 w-full" />
            <Bar className="h-80 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 text-gray-900 sm:p-6" aria-busy="true">
      <p className="sr-only">กำลังโหลดฟอร์ม</p>
      <div className="mx-auto max-w-3xl" aria-hidden>
        <Bar className="mb-4 h-4 w-16" />
        <Bar className="mb-6 h-8 w-64" />
        <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <Bar className="mb-2 h-4 w-28" />
              <Bar className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
