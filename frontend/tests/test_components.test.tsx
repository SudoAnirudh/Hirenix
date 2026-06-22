import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TechTreeNode from '../components/dashboard/TechTreeNode';

describe('TechTreeNode Accessibility', () => {
  it('renders resources trigger with correct aria attributes and tabIndex', () => {
    const mockSkill = {
      name: 'React',
      status: 'completed',
      priority: 'high',
      estimated_time: '2h',
      description: 'Test',
      resources: [{ title: 'Resource 1', url: '#', type: 'article' }]
    };

    render(<TechTreeNode skill={mockSkill as any} index={0} />);

    const trigger = screen.getByLabelText('View resources preview');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('tabIndex', '0');
    expect(trigger).toHaveClass('focus-visible:outline-none');
    expect(trigger).toHaveClass('focus-visible:ring-2');
  });

  it('renders Mark Done button with focus-visible classes', () => {
     const mockSkill = {
      name: 'React',
      status: 'in_progress',
      priority: 'high',
      estimated_time: '2h',
      description: 'Test',
      resources: []
    };

    render(<TechTreeNode skill={mockSkill as any} index={0} />);

    const markDoneBtn = screen.getByRole('button', { name: /Mark Done/i });
    expect(markDoneBtn).toBeInTheDocument();
    expect(markDoneBtn).toHaveClass('focus-visible:outline-none');
  });
});
