const loaderRows = Array.from({ length: 9 }, () => "dreamledge-creators");

export function DreamledgeLoader() {
  return (
    <div className="dreamledge-loader" aria-label="Loading Dreamledge Creators">
      {loaderRows.map((row, index) => (
        <div key={`${row}-${index}`} className="text">
          <span>{row}</span>
        </div>
      ))}
      <div className="line" />
    </div>
  );
}
