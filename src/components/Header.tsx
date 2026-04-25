interface HeaderProps {
  crumb: string;
  title: string;
}

export default function Header({ crumb, title }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__title">
        <span className="header__crumb">{crumb}</span>
        <h1>{title}</h1>
      </div>
      <div className="header__meta">
        Coverage: Maruti Suzuki · Hyundai Motor India · Mahindra &amp; Mahindra · Tata Motors PV
      </div>
    </header>
  );
}
