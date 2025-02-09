import { Logger, createLogger, format, transports } from 'winston'

const logger: Logger = createLogger({
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    format.json(),
    format.errors({ stack: true })
  ),
  transports: [new transports.Console()],
})

export default logger
