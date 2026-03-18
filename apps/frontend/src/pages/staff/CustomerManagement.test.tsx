import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomerManagement } from './CustomerManagement';
import type { CustomerDto, DestinationDto } from '../../types/customer';

const mockCustomers: CustomerDto[] = [
  { customerId: 1, name: '山田花店', phone: '03-1111-1111', email: 'yamada@example.com' },
  { customerId: 2, name: '鈴木花店', phone: '03-2222-2222', email: null },
];

const mockDestinations: DestinationDto[] = [
  { destinationId: 1, customerId: 1, name: '田中太郎', address: '東京都渋谷区1-1-1', phone: '03-3333-3333' },
];

const mockFetchCustomers = vi.fn<() => Promise<CustomerDto[]>>();
const mockCreateCustomer = vi.fn<(input: { name: string; phone: string; email: string | null }) => Promise<CustomerDto>>();
const mockUpdateCustomer = vi.fn<(id: number, input: { name: string; phone: string; email: string | null }) => Promise<CustomerDto>>();
const mockFetchDestinations = vi.fn<(customerId: number) => Promise<DestinationDto[]>>();

describe('CustomerManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchCustomers.mockResolvedValue(mockCustomers);
    mockFetchDestinations.mockResolvedValue(mockDestinations);
  });

  it('得意先一覧が表示される', async () => {
    render(
      <CustomerManagement
        fetchCustomers={mockFetchCustomers}
        createCustomer={mockCreateCustomer}
        updateCustomer={mockUpdateCustomer}
        fetchDestinations={mockFetchDestinations}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('山田花店')).toBeInTheDocument();
      expect(screen.getByText('鈴木花店')).toBeInTheDocument();
    });
  });

  it('テーブルにaria-labelが設定されている', async () => {
    render(
      <CustomerManagement
        fetchCustomers={mockFetchCustomers}
        createCustomer={mockCreateCustomer}
        updateCustomer={mockUpdateCustomer}
        fetchDestinations={mockFetchDestinations}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('table', { name: '得意先一覧' })).toBeInTheDocument();
    });
  });

  it('新規登録ボタンでフォームが表示される', async () => {
    render(
      <CustomerManagement
        fetchCustomers={mockFetchCustomers}
        createCustomer={mockCreateCustomer}
        updateCustomer={mockUpdateCustomer}
        fetchDestinations={mockFetchDestinations}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('山田花店')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('新規登録'));

    expect(screen.getByLabelText('得意先名')).toBeInTheDocument();
  });

  it('新規登録できる', async () => {
    const newCustomer: CustomerDto = {
      customerId: 3,
      name: '佐藤花店',
      phone: '03-4444-4444',
      email: 'sato@example.com',
    };
    mockCreateCustomer.mockResolvedValue(newCustomer);
    mockFetchCustomers
      .mockResolvedValueOnce(mockCustomers)
      .mockResolvedValueOnce([...mockCustomers, newCustomer]);

    render(
      <CustomerManagement
        fetchCustomers={mockFetchCustomers}
        createCustomer={mockCreateCustomer}
        updateCustomer={mockUpdateCustomer}
        fetchDestinations={mockFetchDestinations}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('山田花店')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('新規登録'));

    await userEvent.clear(screen.getByLabelText('得意先名'));
    await userEvent.type(screen.getByLabelText('得意先名'), '佐藤花店');
    await userEvent.clear(screen.getByLabelText('電話番号'));
    await userEvent.type(screen.getByLabelText('電話番号'), '03-4444-4444');
    await userEvent.clear(screen.getByLabelText('メールアドレス'));
    await userEvent.type(screen.getByLabelText('メールアドレス'), 'sato@example.com');

    await userEvent.click(screen.getByText('保存する'));

    await waitFor(() => {
      expect(mockCreateCustomer).toHaveBeenCalledWith({
        name: '佐藤花店',
        phone: '03-4444-4444',
        email: 'sato@example.com',
      });
    });
  });

  it('編集ボタンで既存データがフォームに表示される', async () => {
    render(
      <CustomerManagement
        fetchCustomers={mockFetchCustomers}
        createCustomer={mockCreateCustomer}
        updateCustomer={mockUpdateCustomer}
        fetchDestinations={mockFetchDestinations}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('山田花店')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('編集');
    await userEvent.click(editButtons[0]);

    expect(screen.getByLabelText('得意先名')).toHaveValue('山田花店');
    expect(screen.getByLabelText('電話番号')).toHaveValue('03-1111-1111');
    expect(screen.getByLabelText('メールアドレス')).toHaveValue('yamada@example.com');
  });

  it('届け先ボタンで届け先一覧が表示される', async () => {
    render(
      <CustomerManagement
        fetchCustomers={mockFetchCustomers}
        createCustomer={mockCreateCustomer}
        updateCustomer={mockUpdateCustomer}
        fetchDestinations={mockFetchDestinations}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('山田花店')).toBeInTheDocument();
    });

    const destButtons = screen.getAllByText('届け先');
    await userEvent.click(destButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('田中太郎')).toBeInTheDocument();
      expect(screen.getByText('東京都渋谷区1-1-1')).toBeInTheDocument();
    });
  });
});
