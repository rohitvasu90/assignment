export default function EmptyState({ message = 'No data found', action }) {
  return (
    <div className="empty-state">
      <p>{message}</p>
      {action}
    </div>
  );
}
