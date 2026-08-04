INSERT INTO public.site_content (key, body)
VALUES ('contact_email', 'dennimageai@gmail.com')
ON CONFLICT (key) DO NOTHING;