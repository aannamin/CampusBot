
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own role on signup" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Faculty table
CREATE TABLE public.faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  room TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view faculty" ON public.faculty FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert faculty" ON public.faculty FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update faculty" ON public.faculty FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete faculty" ON public.faculty FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Labs table
CREATE TABLE public.labs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  building TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view labs" ON public.labs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert labs" ON public.labs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update labs" ON public.labs FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete labs" ON public.labs FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Offices table
CREATE TABLE public.offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view offices" ON public.offices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert offices" ON public.offices FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update offices" ON public.offices FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete offices" ON public.offices FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Canteen table
CREATE TABLE public.canteen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Main Canteen',
  timings TEXT NOT NULL,
  menu TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.canteen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view canteen" ON public.canteen FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert canteen" ON public.canteen FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update canteen" ON public.canteen FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete canteen" ON public.canteen FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Exam halls table
CREATE TABLE public.exam_halls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hall TEXT NOT NULL,
  details TEXT NOT NULL,
  building TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.exam_halls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view exam_halls" ON public.exam_halls FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert exam_halls" ON public.exam_halls FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update exam_halls" ON public.exam_halls FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete exam_halls" ON public.exam_halls FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON public.faculty FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_labs_updated_at BEFORE UPDATE ON public.labs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_offices_updated_at BEFORE UPDATE ON public.offices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_canteen_updated_at BEFORE UPDATE ON public.canteen FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_exam_halls_updated_at BEFORE UPDATE ON public.exam_halls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
