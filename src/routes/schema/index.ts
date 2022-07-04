import { FastifyInstance, FastifyPluginAsync, RegisterOptions } from 'fastify';
import SchemaManager from '../../classes/SchemaManager';
import log from '../../lib/logger';
import Redis from '../../classes/Redis';

const schema: FastifyPluginAsync = async (app: FastifyInstance, opts?: RegisterOptions): Promise<void> => {
    app.get(
        '',
        {
            schema: {
                description: 'Get Team Fortress 2 Item Schema (Warning: Might cause browser to freeze)',
                tags: ['Schema']
            }
        },
        (req, reply) => {
            return reply
                .code(200)
                .header('Content-Type', 'application/json; charset=utf-8')
                .send(SchemaManager.schemaManager.schema);
        }
    );

    app.get(
        '/download',
        {
            schema: {
                description: 'Download the Team Fortress 2 Item Schema',
                tags: ['Schema']
            }
        },
        (req, reply) => {
            return reply
                .code(200)
                .header('Content-Disposition', 'attachment; filename=schema.json')
                .send(JSON.stringify(SchemaManager.schemaManager.schema, null, 2));
        }
    );

    const timeoutTime = 30 * 60 * 1000;
    let lastExecutedRefreshSchemaTime = null;
    let executeRefreshSchemaTimeout: NodeJS.Timeout;

    app.patch(
        '/refresh',
        {
            schema: {
                description: 'Request to refresh schema (only once per 30 minutes globally)',
                tags: ['Schema']
            }
        },
        async (req, reply) => {
            const executedRefreshSchema = JSON.parse(await Redis.getCache('s_executedRefreshSchema'));

            if (executedRefreshSchema === null) {
                Redis.setCachex('s_executedRefreshSchema', timeoutTime, 'false');
                lastExecutedRefreshSchemaTime = null;
                Redis.setCachex('s_lastExecutedRefreshSchemaTime', timeoutTime, 'null');
            } else {
                lastExecutedRefreshSchemaTime = JSON.parse(await Redis.getCache('s_lastExecutedRefreshSchemaTime'));
            }

            const newExecutedTime = Date.now();
            const timeDiff = newExecutedTime - lastExecutedRefreshSchemaTime;

            if (executedRefreshSchema) {
                return reply
                    .code(429)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        success: false,
                        message: 'This has already been called in the last 30 minutes',
                        'retry-after': timeoutTime - timeDiff
                    });
            }

            clearTimeout(executeRefreshSchemaTimeout);
            lastExecutedRefreshSchemaTime = Date.now();
            Redis.setCachex('s_lastExecutedRefreshSchemaTime', timeoutTime, String(lastExecutedRefreshSchemaTime));
            Redis.setCachex('s_executedRefreshSchema', timeoutTime, 'true');

            executeRefreshSchemaTimeout = setTimeout(() => {
                Redis.setCachex('s_lastExecutedRefreshSchemaTime', timeoutTime, 'null');
                Redis.setCachex('s_executedRefreshSchema', timeoutTime, 'false');
                clearTimeout(executeRefreshSchemaTimeout);
            }, timeoutTime);

            SchemaManager.schemaManager.getSchema(err => {
                if (err) {
                    log.error(err);
                    return reply
                        .code(500)
                        .header('Content-Type', 'application/json; charset=utf-8')
                        .send({
                            success: false,
                            message: 'Error while requesting schema',
                            'retry-after': timeoutTime - lastExecutedRefreshSchemaTime
                        });
                }

                return reply.code(200).header('Content-Type', 'application/json; charset=utf-8').send({
                    success: true
                });
            });
        }
    );
};

export default schema;
