CREATE TABLE public.password_requirements (user_id uuid PRIMARY KEY, password_fingerprint text NOT NULL);
GRANT ALL ON public.password_requirements TO service_role;
ALTER TABLE public.password_requirements ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.password_change_required() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.password_requirements p JOIN auth.users u ON u.id = p.user_id WHERE u.id = auth.uid() AND p.password_fingerprint = md5(u.encrypted_password)) $$;
REVOKE ALL ON FUNCTION public.password_change_required() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.password_change_required() TO authenticated;
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = _user_id AND r.role = _role) AND NOT EXISTS (SELECT 1 FROM public.password_requirements p JOIN auth.users u ON u.id = p.user_id WHERE u.id = _user_id AND p.password_fingerprint = md5(u.encrypted_password)) $$;