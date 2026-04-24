import { useProjectStore } from '../../stores/project-store';

export default function ProjectMetadata(): React.ReactElement {
  const title = useProjectStore((s) => s.title);
  const author = useProjectStore((s) => s.author);
  const sampleRate = useProjectStore((s) => s.sampleRate);
  const version = useProjectStore((s) => s.version);
  const filePath = useProjectStore((s) => s.filePath);

  const fields = [
    { label: 'Title', value: title || 'Untitled' },
    { label: 'Author', value: author || '(none)' },
    { label: 'Sample Rate', value: sampleRate ? `${sampleRate} Hz` : '(not set)' },
    { label: 'Version', value: version || '(unknown)' },
    { label: 'File', value: filePath ? filePath.split('/').pop() : '(unsaved)' },
  ];

  return (
    <section>
      <h3 className="text-base font-semibold text-blue-accent mb-3 pb-1 border-b border-blue-border">
        Project Details
      </h3>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        {fields.map(({ label, value }) => (
          <div key={label} className="contents">
            <dt className="text-blue-muted">{label}</dt>
            <dd className="text-gray-100 truncate" title={value}>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
