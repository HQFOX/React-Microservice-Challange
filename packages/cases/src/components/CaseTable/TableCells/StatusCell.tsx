interface StatusConfig {
  label: string;
  variant?: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  CASE_RESOLVED_RISK_DETECTED: {
    label: 'Resolved, Risk Detected',
    variant: 'alerts.inlineError',
  },
  CASE_RESOLVED_NO_RISK_DETECTED: {
    label: 'Resolved, No Risk Detected',
    variant: 'alerts.inlineSuccess',
  },
  CASE_NOT_STARTED: { label: 'Not Started' },
  CASE_IN_PROGRESS: { label: 'In Progress' },
  CASE_ON_HOLD: { label: 'On Hold' },
};

export const StatusCell = ({ status }: { status: string }) => {
  const { label, variant } = STATUS_MAP[status] ?? { label: status };

  if (!variant) return <span>{label}</span>;

  return (
    <span
      sx={{
        variant,
        px: 'spacing-xs',
        py: 'spacing-3xs',
        borderRadius: 'radius-sm',
      }}
    >
      {label}
    </span>
  );
};
