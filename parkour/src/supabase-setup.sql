-- Parkour leaderboard: run once in Supabase (SQL Editor -> New query -> paste -> Run).
-- One row per player (random id kept on the phone). The game only sends a nickname,
-- best scores, number of games and total play time.

create table if not exists public.players (
  pid uuid primary key,
  nick text not null check (char_length(nick) between 2 and 16),
  best1 int not null default 0,
  best2 int not null default 0,
  dist1 int not null default 0,
  stars2 int not null default 0,
  games int not null default 0,
  seconds int not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.players enable row level security;

-- Everyone can read the leaderboard, but not the private player id.
drop policy if exists "leaderboard is public" on public.players;
create policy "leaderboard is public" on public.players for select using (true);
revoke all on public.players from anon, authenticated;
grant select (nick, best1, best2, dist1, stars2, games, seconds, updated_at) on public.players to anon, authenticated;

-- Scores are written only through this function, which keeps the best values.
create or replace function public.submit_score(
  p_pid uuid, p_nick text, p_best1 int, p_best2 int, p_dist1 int, p_stars2 int, p_games int, p_seconds int
) returns void
language sql security definer set search_path = public as $$
  insert into players (pid, nick, best1, best2, dist1, stars2, games, seconds, updated_at)
  values (p_pid, left(trim(p_nick), 16),
          least(greatest(p_best1, 0), 1000000), least(greatest(p_best2, 0), 1000000),
          least(greatest(p_dist1, 0), 100000), least(greatest(p_stars2, 0), 3),
          least(greatest(p_games, 0), 100000), least(greatest(p_seconds, 0), 10000000), now())
  on conflict (pid) do update set
    nick = excluded.nick,
    best1 = greatest(players.best1, excluded.best1),
    best2 = greatest(players.best2, excluded.best2),
    dist1 = greatest(players.dist1, excluded.dist1),
    stars2 = greatest(players.stars2, excluded.stars2),
    games = greatest(players.games, excluded.games),
    seconds = greatest(players.seconds, excluded.seconds),
    updated_at = now();
$$;

revoke all on function public.submit_score(uuid, text, int, int, int, int, int, int) from public;
grant execute on function public.submit_score(uuid, text, int, int, int, int, int, int) to anon, authenticated;
