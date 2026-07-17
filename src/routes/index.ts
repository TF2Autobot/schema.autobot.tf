import { FastifyInstance, FastifyPluginAsync, RegisterOptions } from 'fastify';

const root: FastifyPluginAsync = async (app: FastifyInstance, opts?: RegisterOptions): Promise<void> => {
    app.get(
        '',
        {
            schema: {
                hide: true
            }
        },
        (req, reply) => {
            return reply.redirect('/docs/static/index.html', 308);
        }
    );
};

export default root;
