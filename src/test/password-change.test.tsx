import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PasswordChange } from '@/components/admin/password-change';

const updateUser = vi.hoisted(() => vi.fn());
vi.mock('@/integrations/supabase/client', () => ({ supabase: { auth: { updateUser } } }));

describe('Temporary password replacement', () => {
  it('does not accept the temporary password as the new password', async () => {
    render(<PasswordChange onChanged={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Mot de passe provisoire'), { target: { value: 'temporary-example' } });
    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), { target: { value: 'temporary-example' } });
    fireEvent.change(screen.getByLabelText('Confirmer le nouveau mot de passe'), { target: { value: 'temporary-example' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Enregistrer et accéder à l’administration' }).closest('form') as HTMLFormElement);
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(updateUser).not.toHaveBeenCalled();
  });
});