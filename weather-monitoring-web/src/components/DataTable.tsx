import React from 'react';

interface DataTableProps {
  labels: string[];
  series: Array<{ label: string; data: number[] }>;
  compareSeries?: Array<{ label: string; data: number[] }>;
}

const DataTable: React.FC<DataTableProps> = ({ labels, series, compareSeries }) => {
  return (
    <div className="chart-card">
      <table className="data-table">
        <thead>
          <tr>
            <th>Time</th>
            {series.map((s) => (
              <th key={s.label}>{s.label}</th>
            ))}
            {compareSeries && compareSeries.map((s) => <th key={'c-' + s.label}>Prev {s.label}</th>)}
            {compareSeries && <th>Diff</th>}
          </tr>
        </thead>
        <tbody>
          {labels.map((t, idx) => (
            <tr key={t}>
              <td>{t}</td>
              {series.map((s) => (
                <td key={s.label + idx}>{s.data[idx] ?? '-'}</td>
              ))}
              {compareSeries && compareSeries.map((s) => (
                <td key={'c-' + s.label + idx}>{s.data[idx] ?? '-'}</td>
              ))}
              {compareSeries && (
                <td>
                  {/* compute diff of first series vs first compare */}
                  {typeof series[0]?.data[idx] === 'number' && typeof compareSeries[0]?.data[idx] === 'number' ? (
                    <span className={(series[0].data[idx] - compareSeries[0].data[idx]) >= 0 ? 'data-diff-positive' : 'data-diff-negative'}>
                      {(series[0].data[idx] - compareSeries[0].data[idx]).toFixed(1)}
                    </span>
                  ) : (
                    '-' 
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
