
interface PropTypes {
  name: string;
  children: React.ReactNode;
}

export default function ChartSection({ name, children}: PropTypes) {
  return (
    <div className="flex flex-col items-start gap-3 w-full overflow-hidden">
      <p className="text-lg text-text-primary">{name}</p>
      <div className="flex flex-col gap-6 w-full justify-center items-center bg-main-primary rounded-3xl relative">
        {children}
      </div>
    </div>
  );
}
