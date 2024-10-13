import { FastifyInstance, FastifyPluginAsync, RegisterOptions } from 'fastify';
import SchemaManager from '../../classes/SchemaManager';
import log from '../../lib/logger';

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
