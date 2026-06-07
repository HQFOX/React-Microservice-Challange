import { render, screen } from '@testing-library/react';

import { StatusCell } from './StatusCell';

describe('StatusCell', () => {
  describe('known statuses', () => {
    it('renders "Resolved, Risk Detected" for CASE_RESOLVED_RISK_DETECTED', () => {
      render(<StatusCell status="CASE_RESOLVED_RISK_DETECTED" />);
      expect(screen.getByText('Resolved, Risk Detected')).toBeInTheDocument();
    });

    it('renders "Resolved, No Risk Detected" for CASE_RESOLVED_NO_RISK_DETECTED', () => {
      render(<StatusCell status="CASE_RESOLVED_NO_RISK_DETECTED" />);
      expect(
        screen.getByText('Resolved, No Risk Detected'),
      ).toBeInTheDocument();
    });

    it('renders "Not Started" for CASE_NOT_STARTED', () => {
      render(<StatusCell status="CASE_NOT_STARTED" />);
      expect(screen.getByText('Not Started')).toBeInTheDocument();
    });

    it('renders "In Progress" for CASE_IN_PROGRESS', () => {
      render(<StatusCell status="CASE_IN_PROGRESS" />);
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('renders "On Hold" for CASE_ON_HOLD', () => {
      render(<StatusCell status="CASE_ON_HOLD" />);
      expect(screen.getByText('On Hold')).toBeInTheDocument();
    });
  });

  describe('unknown status', () => {
    it('renders the raw status string as a fallback', () => {
      render(<StatusCell status="SOME_UNKNOWN_STATUS" />);
      expect(screen.getByText('SOME_UNKNOWN_STATUS')).toBeInTheDocument();
    });
  });

  describe('variant rendering', () => {
    it('renders a span for statuses with a variant', () => {
      render(<StatusCell status="CASE_RESOLVED_RISK_DETECTED" />);
      expect(screen.getByText('Resolved, Risk Detected').tagName).toBe('SPAN');
    });

    it('renders a plain span for statuses without a variant', () => {
      render(<StatusCell status="CASE_NOT_STARTED" />);
      expect(screen.getByText('Not Started').tagName).toBe('SPAN');
    });
  });
});
