import { WebhookEvent } from '@prisma/client'

export default function WebhookEventsTable({
  events,
}: {
  events: WebhookEvent[]
}) {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Received At</th>
          <th>Event Type</th>
          <th>Processed</th>
          <th>Payload</th>
        </tr>
      </thead>
      <tbody>
        {events.map((event) => (
          <tr key={event.id}>
            <td>{event.id}</td>
            <td>{new Date(event.receivedAt).toLocaleString()}</td>
            <td>{event.eventType}</td>
            <td>{event.processed ? 'Yes' : 'No'}</td>
            <td>
              <pre>{JSON.stringify(event.payload, null, 2)}</pre>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
