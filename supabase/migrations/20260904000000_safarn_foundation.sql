-- Safarn Foundation Migration

-- Enable pgcrypto for UUID generation if needed (usually enabled by default in Supabase)
create extension if not exists pgcrypto;

--------------------------------------------------------------------------------
-- PROFILES
--------------------------------------------------------------------------------
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone" 
on public.profiles for select using (true);

create policy "Users can insert their own profile" 
on public.profiles for insert with check (id = auth.uid());

create policy "Users can update their own profile" 
on public.profiles for update using (id = auth.uid());

--------------------------------------------------------------------------------
-- TRIPS
--------------------------------------------------------------------------------
create type public.trip_status as enum ('upcoming', 'ongoing', 'completed', 'draft');

create table public.trips (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  start_date date not null,
  end_date date not null,
  type text not null,
  travelers integer not null default 1,
  cover_image text,
  status public.trip_status not null default 'upcoming',
  notes text,
  is_public boolean default false not null,
  share_id text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.trips enable row level security;

create policy "Users can view their own trips" 
on public.trips for select using (user_id = auth.uid());

create policy "Public trips are viewable by everyone" 
on public.trips for select using (is_public = true);

create policy "Users can create trips" 
on public.trips for insert with check (user_id = auth.uid());

create policy "Users can update their own trips" 
on public.trips for update using (user_id = auth.uid());

create policy "Users can delete their own trips" 
on public.trips for delete using (user_id = auth.uid());

--------------------------------------------------------------------------------
-- TRIP MEMBERS
--------------------------------------------------------------------------------
create type public.trip_role as enum ('owner', 'member', 'viewer');

create table public.trip_members (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role public.trip_role not null default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(trip_id, user_id)
);

alter table public.trip_members enable row level security;

-- Add policy to trips to allow members to view
create policy "Members can view trips they belong to" 
on public.trips for select 
using (id in (select trip_id from public.trip_members where user_id = auth.uid()));

create policy "Users can view members of trips they own or belong to" 
on public.trip_members for select 
using (
  user_id = auth.uid() or 
  trip_id in (select id from public.trips where user_id = auth.uid()) or
  trip_id in (select trip_id from public.trip_members where user_id = auth.uid())
);

create policy "Trip owners can add members" 
on public.trip_members for insert 
with check (trip_id in (select id from public.trips where user_id = auth.uid()));

create policy "Trip owners can update members" 
on public.trip_members for update 
using (trip_id in (select id from public.trips where user_id = auth.uid()));

create policy "Trip owners can delete members" 
on public.trip_members for delete 
using (trip_id in (select id from public.trips where user_id = auth.uid()));

--------------------------------------------------------------------------------
-- EDIT PERMISSION HELPER
--------------------------------------------------------------------------------
create function public.can_edit_trip(check_trip_id uuid) returns boolean as $$
  select exists (
    select 1 from public.trips where id = check_trip_id and user_id = auth.uid()
  ) or exists (
    select 1 from public.trip_members where trip_id = check_trip_id and user_id = auth.uid() and role in ('owner', 'member')
  );
$$ language sql security definer;

--------------------------------------------------------------------------------
-- CITY STOPS
--------------------------------------------------------------------------------
create table public.city_stops (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  destination_id text,
  name text not null,
  nights integer not null default 1,
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.city_stops enable row level security;

create policy "View city stops" on public.city_stops for select using (trip_id in (select id from public.trips));
create policy "Insert city stops" on public.city_stops for insert with check (public.can_edit_trip(trip_id));
create policy "Update city stops" on public.city_stops for update using (public.can_edit_trip(trip_id));
create policy "Delete city stops" on public.city_stops for delete using (public.can_edit_trip(trip_id));

--------------------------------------------------------------------------------
-- ITINERARY DAYS
--------------------------------------------------------------------------------
create table public.itinerary_days (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  city_id uuid references public.city_stops(id) on delete cascade not null,
  date date not null,
  day_number integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.itinerary_days enable row level security;

create policy "View itinerary days" on public.itinerary_days for select using (trip_id in (select id from public.trips));
create policy "Insert itinerary days" on public.itinerary_days for insert with check (public.can_edit_trip(trip_id));
create policy "Update itinerary days" on public.itinerary_days for update using (public.can_edit_trip(trip_id));
create policy "Delete itinerary days" on public.itinerary_days for delete using (public.can_edit_trip(trip_id));

--------------------------------------------------------------------------------
-- ACTIVITY CATALOG
--------------------------------------------------------------------------------
create table public.activity_catalog (
  id uuid default gen_random_uuid() primary key,
  destination_id text,
  name text not null,
  category text,
  image text,
  duration text,
  price numeric(10, 2),
  rating numeric(3, 2),
  description text,
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.activity_catalog enable row level security;
create policy "Activity catalog is public" on public.activity_catalog for select using (true);

--------------------------------------------------------------------------------
-- TRIP ACTIVITIES
--------------------------------------------------------------------------------
create type public.activity_type as enum ('sightseeing', 'food', 'relaxation', 'adventure', 'culture', 'nature', 'spiritual', 'custom');

create table public.trip_activities (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  day_id uuid references public.itinerary_days(id) on delete cascade not null,
  catalog_activity_id uuid references public.activity_catalog(id) on delete set null,
  title text not null,
  description text,
  time time,
  location text,
  estimated_cost numeric(10, 2),
  type public.activity_type,
  order_index integer not null default 0,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.trip_activities enable row level security;

create policy "View trip activities" on public.trip_activities for select using (trip_id in (select id from public.trips));
create policy "Insert trip activities" on public.trip_activities for insert with check (public.can_edit_trip(trip_id));
create policy "Update trip activities" on public.trip_activities for update using (public.can_edit_trip(trip_id));
create policy "Delete trip activities" on public.trip_activities for delete using (public.can_edit_trip(trip_id));

--------------------------------------------------------------------------------
-- TRAVEL SEGMENTS
--------------------------------------------------------------------------------
create type public.travel_mode as enum ('flight', 'train', 'bus', 'cab', 'self-drive');

create table public.travel_segments (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  from_city_id uuid references public.city_stops(id) on delete cascade not null,
  to_city_id uuid references public.city_stops(id) on delete cascade not null,
  mode public.travel_mode not null,
  estimated_time text,
  estimated_cost numeric(10, 2),
  departure_time timestamp with time zone,
  arrival_time timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.travel_segments enable row level security;

create policy "View travel segments" on public.travel_segments for select using (trip_id in (select id from public.trips));
create policy "Insert travel segments" on public.travel_segments for insert with check (public.can_edit_trip(trip_id));
create policy "Update travel segments" on public.travel_segments for update using (public.can_edit_trip(trip_id));
create policy "Delete travel segments" on public.travel_segments for delete using (public.can_edit_trip(trip_id));

--------------------------------------------------------------------------------
-- BUDGETS & EXPENSES
--------------------------------------------------------------------------------
create table public.budgets (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null unique,
  total_estimated numeric(12, 2) not null,
  total_actual numeric(12, 2),
  currency text not null default 'INR',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create type public.expense_category as enum ('transport', 'accommodation', 'activities', 'food', 'other');

create table public.budget_categories (
  id uuid default gen_random_uuid() primary key,
  budget_id uuid references public.budgets(id) on delete cascade not null,
  category public.expense_category not null,
  amount numeric(10, 2) not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(budget_id, category)
);

create table public.expenses (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  title text not null,
  amount numeric(10, 2) not null,
  currency text not null default 'INR',
  category public.expense_category not null,
  date date not null,
  paid_by text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.budgets enable row level security;
alter table public.budget_categories enable row level security;
alter table public.expenses enable row level security;

create policy "View budgets" on public.budgets for select using (trip_id in (select id from public.trips));
create policy "Insert budgets" on public.budgets for insert with check (public.can_edit_trip(trip_id));
create policy "Update budgets" on public.budgets for update using (public.can_edit_trip(trip_id));
create policy "Delete budgets" on public.budgets for delete using (public.can_edit_trip(trip_id));

create policy "View budget categories" on public.budget_categories for select using (budget_id in (select id from public.budgets));
create policy "Insert budget categories" on public.budget_categories for insert with check (budget_id in (select id from public.budgets where public.can_edit_trip(trip_id)));
create policy "Update budget categories" on public.budget_categories for update using (budget_id in (select id from public.budgets where public.can_edit_trip(trip_id)));
create policy "Delete budget categories" on public.budget_categories for delete using (budget_id in (select id from public.budgets where public.can_edit_trip(trip_id)));

create policy "View expenses" on public.expenses for select using (trip_id in (select id from public.trips));
create policy "Insert expenses" on public.expenses for insert with check (public.can_edit_trip(trip_id));
create policy "Update expenses" on public.expenses for update using (public.can_edit_trip(trip_id));
create policy "Delete expenses" on public.expenses for delete using (public.can_edit_trip(trip_id));

--------------------------------------------------------------------------------
-- WISHLISTS
--------------------------------------------------------------------------------
create type public.wishlist_item_type as enum ('destination', 'activity');

create table public.wishlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  item_type public.wishlist_item_type not null,
  item_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, item_type, item_id)
);

alter table public.wishlists enable row level security;
create policy "Users view own wishlist" on public.wishlists for select using (user_id = auth.uid());
create policy "Users insert own wishlist" on public.wishlists for insert with check (user_id = auth.uid());
create policy "Users delete own wishlist" on public.wishlists for delete using (user_id = auth.uid());

--------------------------------------------------------------------------------
-- USER PREFERENCES
--------------------------------------------------------------------------------
create table public.user_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  currency text not null default 'INR',
  language text not null default 'en',
  units text not null default 'metric',
  trip_reminders boolean not null default true,
  activity_alerts boolean not null default true,
  budget_alerts boolean not null default true,
  product_updates boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_preferences enable row level security;
create policy "Users view own preferences" on public.user_preferences for select using (user_id = auth.uid());
create policy "Users insert own preferences" on public.user_preferences for insert with check (user_id = auth.uid());
create policy "Users update own preferences" on public.user_preferences for update using (user_id = auth.uid());

--------------------------------------------------------------------------------
-- NOTIFICATIONS
--------------------------------------------------------------------------------
create type public.notification_type as enum ('trip_reminder', 'budget_alert', 'itinerary_update', 'recommendation', 'share_activity');

create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type public.notification_type not null,
  title text not null,
  message text not null,
  read boolean not null default false,
  link text,
  trip_id uuid references public.trips(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;
create policy "Users view own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "Users update own notifications" on public.notifications for update using (user_id = auth.uid());
create policy "Users delete own notifications" on public.notifications for delete using (user_id = auth.uid());

--------------------------------------------------------------------------------
-- PUBLIC SHARES
--------------------------------------------------------------------------------
create table public.public_shares (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null unique,
  share_id text not null unique,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.public_shares enable row level security;
create policy "Public shares are viewable by everyone" on public.public_shares for select using (is_active = true);
create policy "Trip owners manage shares" on public.public_shares for insert with check (public.can_edit_trip(trip_id));
create policy "Trip owners update shares" on public.public_shares for update using (public.can_edit_trip(trip_id));
create policy "Trip owners delete shares" on public.public_shares for delete using (public.can_edit_trip(trip_id));

--------------------------------------------------------------------------------
-- INDEXES
--------------------------------------------------------------------------------
create index idx_trips_user_id on public.trips(user_id);
create index idx_trip_members_trip_id on public.trip_members(trip_id);
create index idx_trip_members_user_id on public.trip_members(user_id);
create index idx_city_stops_trip_id on public.city_stops(trip_id);
create index idx_itinerary_days_trip_id on public.itinerary_days(trip_id);
create index idx_trip_activities_trip_id on public.trip_activities(trip_id);
create index idx_trip_activities_day_id on public.trip_activities(day_id);
create index idx_travel_segments_trip_id on public.travel_segments(trip_id);
create index idx_expenses_trip_id on public.expenses(trip_id);
create index idx_wishlists_user_id on public.wishlists(user_id);
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_public_shares_share_id on public.public_shares(share_id);
