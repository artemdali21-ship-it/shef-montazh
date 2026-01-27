-- Create chats table
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID NOT NULL,
  participant_2 UUID NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  text TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  metadata JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chats_participants ON public.chats(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON public.messages(read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_chats_participant_1 ON public.chats(participant_1);
CREATE INDEX IF NOT EXISTS idx_chats_participant_2 ON public.chats(participant_2);

-- Enable Row Level Security
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy for chats: users can only see their own chats
DROP POLICY IF EXISTS chats_select ON public.chats;
CREATE POLICY chats_select ON public.chats FOR SELECT
  USING (
    auth.uid() = participant_1 OR auth.uid() = participant_2
  );

DROP POLICY IF EXISTS chats_insert ON public.chats;
CREATE POLICY chats_insert ON public.chats FOR INSERT
  WITH CHECK (
    auth.uid() = participant_1 OR auth.uid() = participant_2
  );

DROP POLICY IF EXISTS chats_update ON public.chats;
CREATE POLICY chats_update ON public.chats FOR UPDATE
  USING (
    auth.uid() = participant_1 OR auth.uid() = participant_2
  );

-- RLS Policy for messages: users can only see messages in their chats
DROP POLICY IF EXISTS messages_select ON public.messages;
CREATE POLICY messages_select ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chats 
      WHERE public.chats.id = public.messages.chat_id 
      AND (public.chats.participant_1 = auth.uid() OR public.chats.participant_2 = auth.uid())
    )
  );

DROP POLICY IF EXISTS messages_insert ON public.messages;
CREATE POLICY messages_insert ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chats 
      WHERE public.chats.id = public.messages.chat_id 
      AND (public.chats.participant_1 = auth.uid() OR public.chats.participant_2 = auth.uid())
    ) AND sender_id = auth.uid()
  );

-- Create function to update last_message and last_message_at
DROP FUNCTION IF EXISTS public.update_chat_last_message() CASCADE;
CREATE OR REPLACE FUNCTION public.update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chats
  SET last_message = NEW.text,
      last_message_at = NEW.created_at,
      updated_at = NOW()
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_chat_last_message ON public.messages;
CREATE TRIGGER trigger_update_chat_last_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_chat_last_message();
