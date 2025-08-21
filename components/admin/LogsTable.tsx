import { Log } from '@prisma/client'

export default function LogsTable({ logs }: { logs: Log[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Timestamp</th>
          <th>Level</th>
          <th>Message</th>
          <th>Meta</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => (
          <tr key={log.id}>
            <td>{log.id}</td>
            <td>{new Date(log.timestamp).toLocaleString()}</td>
            <td>{log.level}</td>
            <td>{log.message}</td>
            <td>
              <pre>{JSON.stringify(log.meta, null, 2)}</pre>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
