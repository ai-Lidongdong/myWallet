import React from 'react';

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fld">
      <div className="label">{label}</div>
      {children}
    </div>
  );
}

