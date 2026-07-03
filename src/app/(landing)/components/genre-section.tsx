import { Badge } from '@/components/ui/badge';

const genres = [
  'Fiction',
  'Nonfiction',
  'Fantasy',
  'Sci-Fi',
  'Horror',
  'Thriller',
  'Mystery',
  'Romance',
  'Literary Fiction',
  'Historical Fiction',
  'YA Fiction',
  'Middle Grade',
  "Children's Books",
  'Graphic Novels',
  'Comics',
  'Manga',
  'Poetry',
  'Memoir',
  'Biography',
  'Self-Help',
  'Business',
  'Education',
  'Religion / Spirituality',
  'Cookbooks',
  'Health & Wellness',
  'Reference',
  'Short Story Collections',
  'Anthologies',
];

export function GenreSection() {
  return (
    <section id="genres" className="section bg-slate-950">
      <div className="container-page">
        <div className="mb-12 text-center">
          <p className="text-eyebrow mb-3 text-yellow-500/70">Genre Support</p>
          <h2 className="font-display text-h2 font-bold tracking-tight text-slate-100">
            We Publish Every Genre
          </h2>
          <p className="mt-3 text-body-lg text-slate-400">
            From epic fantasy to academic reference — our platform supports a wide range of genres
            and formats.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {genres.map((genre) => (
            <Badge
              key={genre}
              variant="outline"
              className="border-slate-700 bg-slate-800/60 px-3 py-1 text-small text-slate-300 hover:border-yellow-500/40 hover:bg-slate-800"
            >
              {genre}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
