import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { COLORS, FONTS } from '../../brand/tokens';
import { supabase } from '../../lib/supabaseClient';

export default function Community() {
  const { edition } = useOutletContext();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [userId, setUserId] = useState(null);

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    setUserId(userData?.user?.id || null);

    const { data } = await supabase
      .from('community_posts')
      .select('*, post_likes(user_id), post_comments(id, content, created_at, author_name)')
      .eq('edition', edition.id)
      .order('created_at', { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submitPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || !userId) return;
    const { data: profile } = await supabase.from('user_profiles').select('name').eq('id', userId).single();
    await supabase.from('community_posts').insert({
      user_id: userId,
      author_name: profile?.name || 'Anonymous',
      content: newPost.trim(),
      edition: edition.id,
    });
    setNewPost('');
    load();
  };

  const toggleLike = async (post) => {
    if (!userId) return;
    const alreadyLiked = (post.post_likes || []).some((l) => l.user_id === userId);
    if (alreadyLiked) {
      await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', userId);
    } else {
      await supabase.from('post_likes').insert({ post_id: post.id, user_id: userId });
    }
    load();
  };

  return (
    <div style={{ padding: '24px 24px 24px' }}>
      <div style={{ fontFamily: FONTS.display, fontSize: 26, color: COLORS.ink, fontStyle: 'italic' }}>
        Community
      </div>
      <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute, marginTop: 6 }}>
        {edition.community}
      </div>

      <form onSubmit={submitPost} style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share something with the community…"
          rows={3}
          style={{
            fontFamily: FONTS.body, fontSize: 14, padding: 14, borderRadius: 12,
            border: `1px solid ${COLORS.line}`, resize: 'none', boxSizing: 'border-box',
          }}
        />
        <button
          type="submit"
          style={{
            alignSelf: 'flex-start', fontFamily: FONTS.body, fontSize: 13, fontWeight: 500, color: COLORS.bg,
            background: COLORS.ink, border: 'none', padding: '10px 18px', borderRadius: 999, cursor: 'pointer',
          }}
        >
          Post
        </button>
      </form>

      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {loading && <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>Loading…</div>}
        {!loading && posts.length === 0 && (
          <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>
            No posts yet — be the first to share something.
          </div>
        )}
        {posts.map((post) => {
          const liked = (post.post_likes || []).some((l) => l.user_id === userId);
          return (
            <div key={post.id} style={{ padding: 16, borderRadius: 16, background: COLORS.surface, border: `1px solid ${COLORS.line}` }}>
              <div style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: COLORS.ink }}>
                {post.author_name}
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 11, color: COLORS.mute, marginTop: 2 }}>
                {new Date(post.created_at).toLocaleDateString()}
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.ink, marginTop: 10, lineHeight: 1.5 }}>
                {post.content}
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 16, alignItems: 'center' }}>
                <button
                  onClick={() => toggleLike(post)}
                  style={{
                    fontFamily: FONTS.body, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer',
                    color: liked ? COLORS.gold : COLORS.mute, fontWeight: liked ? 600 : 400,
                  }}
                >
                  ♥ {(post.post_likes || []).length}
                </button>
                <span style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mute }}>
                  💬 {(post.post_comments || []).length}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
