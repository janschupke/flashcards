import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ColumnDef } from '@tanstack/react-table';
import { PaginatedTable } from './PaginatedTable';
import { renderWithRouter } from '../../test/test-utils';

interface Row {
  name: string;
  n: number;
}

const columns: ColumnDef<Row>[] = [
  { header: 'Name', accessorKey: 'name' },
  { header: 'N', accessorKey: 'n' },
];

const rows = (count: number): Row[] =>
  Array.from({ length: count }, (_, i) => ({ name: `row-${i}`, n: i }));

const renderTable = (count: number, pageSize = 10): ReturnType<typeof renderWithRouter> =>
  renderWithRouter(
    <PaginatedTable data={rows(count)} columns={columns} caption="Test table" pageSize={pageSize} />
  );

describe('PaginatedTable', () => {
  it('names the table and marks its column headers', () => {
    renderTable(3);

    expect(screen.getByRole('table', { name: 'Test table' })).toBeInTheDocument();
    screen.getAllByRole('columnheader').forEach((th) => {
      expect(th).toHaveAttribute('scope', 'col');
    });
  });

  it('renders only one page of rows', () => {
    renderTable(25, 10);

    // 10 body rows plus the header row.
    expect(screen.getAllByRole('row')).toHaveLength(11);
    expect(screen.getByText('Page')).toBeInTheDocument();
    expect(screen.getByText(/Showing 10 of 25 entries/)).toBeInTheDocument();
  });

  it('pages forward and back', async () => {
    const user = userEvent.setup();
    renderTable(25, 10);
    const body = (): HTMLElement => screen.getAllByRole('rowgroup')[1] as HTMLElement;

    expect(within(body()).getByText('row-0')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(within(body()).getByText('row-10')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(within(body()).getByText('row-0')).toBeInTheDocument();
  });

  it('jumps to the last and first page', async () => {
    const user = userEvent.setup();
    renderTable(25, 10);
    const body = (): HTMLElement => screen.getAllByRole('rowgroup')[1] as HTMLElement;

    await user.click(screen.getByRole('button', { name: 'Last page' }));
    expect(within(body()).getByText('row-24')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'First page' }));
    expect(within(body()).getByText('row-0')).toBeInTheDocument();
  });

  it('disables the paging buttons at the ends', async () => {
    const user = userEvent.setup();
    renderTable(25, 10);

    expect(screen.getByRole('button', { name: 'First page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Last page' }));

    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Last page' })).toBeDisabled();
  });

  it('changes the page size through a labelled select', async () => {
    const user = userEvent.setup();
    renderTable(25, 10);
    const select = screen.getByLabelText('Rows per page:');

    await user.selectOptions(select, '20');

    expect(screen.getAllByRole('row')).toHaveLength(21);
  });

  it('renders an empty body without crashing', () => {
    renderTable(0);

    expect(screen.getAllByRole('row')).toHaveLength(1);
    expect(screen.getByText(/Showing 0 of 0 entries/)).toBeInTheDocument();
  });
});
