import { FastifyInstance, FastifyPluginAsync, RegisterOptions } from 'fastify';
import SchemaManager from '../../schemaManager';

const schema: FastifyPluginAsync = async (app: FastifyInstance, opts?: RegisterOptions): Promise<void> => {
    app.get(
        '',
        {
            schema: {
                description: 'Get Team Fortress 2 Item Schema (Warning: Might cause browser to freeze)',
                tags: ['Schema (raw)']
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
                tags: ['Schema (raw)']
            }
        },
        (req, reply) => {
            return reply
                .code(200)
                .header('Content-Disposition', 'attachment; filename=schema.json')
                .send(JSON.stringify(SchemaManager.schemaManager.schema, null, 2));
        }
    );
};

export default schema;
