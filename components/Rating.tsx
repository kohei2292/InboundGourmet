export default function Rating({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < value ? '#f59e0b' : 'none'} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.164L12 18.896l-7.334 3.846 1.4-8.164L.132 9.21l8.2-1.192z" stroke="#f59e0b" strokeWidth="0.5" />
        </svg>
      ))}
    </span>
  )
}
