import bcrypt from 'bcryptjs';
import { sequelize } from './config/banco.js';
import { Aluno } from './models/alunoM.js';
import { Exercicio } from './models/exercicioM.js';
import { Genero } from './models/generoM.js';
import { GrupoMuscular } from './models/grupoMuscularM.js';
import { Objetivo } from './models/objetivoM.js';
import { Personal } from './models/personalM.js';
import { Treino } from './models/treinoM.js';
import { TreinoExercicio } from './models/treinoExercicioM.js';
import { seedConteudoPadrao } from './utils/seedConteudoPadrao.js';

async function seedDatabase() {
    try {
        console.log('🚀 Iniciando seed do banco de dados...');

        console.log('🔄 Sincronizando tabelas...');
        await sequelize.sync({ force: false });
        console.log('✅ Tabelas sincronizadas!');

        const senhaAluno = await bcrypt.hash('senha123', 10);
        const senhaPersonal = await bcrypt.hash('senha123', 10);

        const [masculino] = await Genero.findOrCreate({
            where: { nome: 'masculino' },
            defaults: { nome: 'masculino' }
        });

        const [feminino] = await Genero.findOrCreate({
            where: { nome: 'feminino' },
            defaults: { nome: 'feminino' }
        });

        const [emagrecer] = await Objetivo.findOrCreate({
            where: { nome: 'emagrecer' },
            defaults: { nome: 'emagrecer' }
        });

        const [ganharMassa] = await Objetivo.findOrCreate({
            where: { nome: 'ganhar_massa' },
            defaults: { nome: 'ganhar_massa' }
        });

        const [manterSaude] = await Objetivo.findOrCreate({
            where: { nome: 'manter_saude' },
            defaults: { nome: 'manter_saude' }
        });

        await seedConteudoPadrao();

        const gruposMusculares = await Promise.all([
            GrupoMuscular.findOrCreate({ where: { nome: 'Peito' }, defaults: { nome: 'Peito' } }),
            GrupoMuscular.findOrCreate({ where: { nome: 'Perna' }, defaults: { nome: 'Perna' } }),
            GrupoMuscular.findOrCreate({ where: { nome: 'Bíceps' }, defaults: { nome: 'Bíceps' } }),
            GrupoMuscular.findOrCreate({ where: { nome: 'Tríceps' }, defaults: { nome: 'Tríceps' } }),
            GrupoMuscular.findOrCreate({ where: { nome: 'Costas' }, defaults: { nome: 'Costas' } }),
            GrupoMuscular.findOrCreate({ where: { nome: 'Ombros' }, defaults: { nome: 'Ombros' } })
        ]);

        const grupoPorNome = Object.fromEntries(gruposMusculares.map(([grupo]) => [grupo.nome, grupo]));

        console.log('👨‍🎓 Criando aluno de teste...');
        const [aluno] = await Aluno.findOrCreate({
            where: { email: 'murilo@email.com' },
            defaults: {
                nome: 'Murilo Borges',
                email: 'murilo@email.com',
                senha: senhaAluno,
                genero_id: masculino.id,
                objetivo_id: ganharMassa.id,
                altura: 1.78,
                massa: 78.5
            }
        });

        const [aluno2] = await Aluno.findOrCreate({
            where: { email: 'ana@email.com' },
            defaults: {
                nome: 'Ana Souza',
                email: 'ana@email.com',
                senha: senhaAluno,
                genero_id: feminino.id,
                objetivo_id: emagrecer.id,
                altura: 1.65,
                massa: 62.0
            }
        });

        console.log('🏋️‍♂️ Criando personal de teste...');
        const [personal] = await Personal.findOrCreate({
            where: { email: 'joao@email.com' },
            defaults: {
                nome: 'João Trainer',
                email: 'joao@email.com',
                senha: senhaPersonal,
                genero_id: masculino.id,
                cref: 'CREF12345'
            }
        });

        const [personal2] = await Personal.findOrCreate({
            where: { email: 'carla@email.com' },
            defaults: {
                nome: 'Carla Mendes',
                email: 'carla@email.com',
                senha: senhaPersonal,
                genero_id: feminino.id,
                cref: 'CREF67890'
            }
        });

        console.log('🏋️ Criando exercícios...');
        const exercicios = await Promise.all([
            Exercicio.findOrCreate({
                where: { nome: 'Supino Reto' },
                defaults: {
                    nome: 'Supino Reto',
                    descricao: 'Deite-se no banco reto com os pés apoiados no chão. Segure a barra com as mãos um pouco mais afastadas que a largura dos ombros. Abaixe a barra em direção ao peito e suba com força.',
                    grupo_muscular_id: grupoPorNome.Peito.id,
                    imagem: 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/supino-inclinado-com-halteres.gif'
                }
            }),
            Exercicio.findOrCreate({
                where: { nome: 'Rosca Direta' },
                defaults: {
                    nome: 'Rosca Direta',
                    descricao: 'De pé, com os pés apoiados no chão. Mantenha os cotovelos junto ao corpo e flexione os antebração para cima levantando a barra até a altura dos ombros.',
                    grupo_muscular_id: grupoPorNome.Bíceps.id,
                    imagem: 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/02/barbell-standing-close-grip-curl.gif'
                }
            }),
            Exercicio.findOrCreate({
                where: { nome: 'Agachamento Livre' },
                defaults: {
                    nome: 'Agachamento Livre',
                    descricao: 'De pé com os pés afastados na largura dos ombros. Coloque a barra sobre os ombros e abaixe dobrando os joelhos até formar um ângulo de 90 graus. Retorne à posição inicial.',
                    grupo_muscular_id: grupoPorNome.Perna.id,
                    imagem: 'https://static.wixstatic.com/media/2edbed_3221a5a1ebd247fe89d72b84e28c4520~mv2.webp'
                }
            }),
            Exercicio.findOrCreate({
                where: { nome: 'Rosca Francês' },
                defaults: {
                    nome: 'Rosca Francês',
                    descricao: 'De pé ou sentado, com a barra/haltere acima da cabeça. Flexione os cotovelos para baixar o peso atrás da cabeça, mantendo os cotovelos estáticos, depois estenda.',
                    grupo_muscular_id: grupoPorNome.Tríceps.id,
                    imagem: 'https://www.hipertrofia.org/blog/wp-content/uploads/2025/01/triceps-frances-com-um-halter-sentado.gif'
                }
            }),
            Exercicio.findOrCreate({
                where: { nome: 'Puxada Frontal' },
                defaults: {
                    nome: 'Puxada Frontal',
                    descricao: 'Sentado na máquina, segure a barra com os braços estendidos. Puxe a barra em direção ao peito, mantendo os cotovelos para baixo, depois retorne controlado.',
                    grupo_muscular_id: grupoPorNome.Costas.id,
                    imagem: 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/costas-puxada-aberta-com-barra-no-pulley.gif'
                }
            }),
            Exercicio.findOrCreate({
                where: { nome: 'Desenvolvimento de Ombros' },
                defaults: {
                    nome: 'Desenvolvimento de Ombros',
                    descricao: 'Sentado, com as mãos segurando halteres ao nível dos ombros. Empurre os halteres para cima até a extensão completa dos cotovelos, depois abaixe em controle.',
                    grupo_muscular_id: grupoPorNome.Ombros.id,
                    imagem: 'https://i0.wp.com/omelhortreino.com.br/wp-content/uploads/2025/03/Desenvolvimento-de-Ombro-no-Banco-com-Halteres-1.gif?resize=500%2C500&ssl=1'
                }
            }),
            Exercicio.findOrCreate({
                where: { nome: 'Leg Press' },
                defaults: {
                    nome: 'Leg Press',
                    descricao: 'Sentado na máquina com os pés na plataforma na largura dos ombros. Flexione os joelhos para 90 graus e estenda as pernas completamente, sem trancar os joelhos.',
                    grupo_muscular_id: grupoPorNome.Perna.id,
                    imagem: 'https://media.tenor.com/xJh_-w_SxckAAAAM/leg-press.gif'
                }
            }),
            Exercicio.findOrCreate({
                where: { nome: 'Barra Fixa' },
                defaults: {
                    nome: 'Barra Fixa',
                    descricao: 'Pendurado na barra com as mãos afastadas um pouco mais que a largura dos ombros. Puxe o corpo para cima dobrando os cotovelos, tentando levar o queixo acima da barra.',
                    grupo_muscular_id: grupoPorNome.Costas.id,
                    imagem: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/08/barra-fixa-negativa.gif'
                }
            }),
            Exercicio.findOrCreate({
                where: { nome: 'Extensão de Perna' },
                defaults: {
                    nome: 'Extensão de Perna',
                    descricao: 'Sentado na máquina com as pernas sob o acolchoamento. Estenda as pernas para cima até a extensão completa, sem trancar os joelhos no final do movimento.',
                    grupo_muscular_id: grupoPorNome.Perna.id,
                    imagem: 'https://media.tenor.com/bqKtsSuqilQAAAAM/gym.gif'
                }
            }),
            Exercicio.findOrCreate({
                where: { nome: 'Crucifixo Inclinado' },
                defaults: {
                    nome: 'Crucifixo Inclinado',
                    descricao: 'Deitado em banco inclinado, segure halteres com os braços ligeiramente flexionados. Abra os braços em movimento de arco, unindo os halteres acima do peito, depois retorne.',
                    grupo_muscular_id: grupoPorNome.Peito.id,
                    imagem: 'https://www.hipertrofia.org/blog/wp-content/uploads/2020/06/dumbbell-incline-fly.gif'
                }
            })
        ]);

        const exercicioPorNome = Object.fromEntries(exercicios.map(([exercicio]) => [exercicio.nome, exercicio]));

        console.log('📋 Criando treinos...');
        const [treinoA] = await Treino.findOrCreate({
            where: {
                nome: 'Treino A - Peito e Pernas',
                aluno_id: aluno.id,
                personal_id: personal.id
            },
            defaults: {
                nome: 'Treino A - Peito e Pernas',
                aluno_id: aluno.id,
                personal_id: personal.id,
                data_criacao: new Date()
            }
        });

        const [treinoB] = await Treino.findOrCreate({
            where: {
                nome: 'Treino B - Costas e Ombros',
                aluno_id: aluno2.id,
                personal_id: personal2.id
            },
            defaults: {
                nome: 'Treino B - Costas e Ombros',
                aluno_id: aluno2.id,
                personal_id: personal2.id,
                data_criacao: new Date()
            }
        });

        console.log('🔗 Vinculando exercícios aos treinos...');
        await Promise.all([
            TreinoExercicio.findOrCreate({
                where: { treino_id: treinoA.id, exercicio_id: exercicioPorNome['Supino reto'].id },
                defaults: { treino_id: treinoA.id, exercicio_id: exercicioPorNome['Supino reto'].id, series: 4, repeticoes: 10, carga: 40, descanso: 60 }
            }),
            TreinoExercicio.findOrCreate({
                where: { treino_id: treinoA.id, exercicio_id: exercicioPorNome['Agachamento livre'].id },
                defaults: { treino_id: treinoA.id, exercicio_id: exercicioPorNome['Agachamento livre'].id, series: 4, repeticoes: 12, carga: 60, descanso: 90 }
            }),
            TreinoExercicio.findOrCreate({
                where: { treino_id: treinoA.id, exercicio_id: exercicioPorNome['Rosca direta'].id },
                defaults: { treino_id: treinoA.id, exercicio_id: exercicioPorNome['Rosca direta'].id, series: 3, repeticoes: 15, carga: 20, descanso: 45 }
            }),
            TreinoExercicio.findOrCreate({
                where: { treino_id: treinoB.id, exercicio_id: exercicioPorNome['Puxada alta'].id },
                defaults: { treino_id: treinoB.id, exercicio_id: exercicioPorNome['Puxada alta'].id, series: 4, repeticoes: 12, carga: 35, descanso: 60 }
            }),
            TreinoExercicio.findOrCreate({
                where: { treino_id: treinoB.id, exercicio_id: exercicioPorNome['Desenvolvimento ombro'].id },
                defaults: { treino_id: treinoB.id, exercicio_id: exercicioPorNome['Desenvolvimento ombro'].id, series: 4, repeticoes: 10, carga: 25, descanso: 60 }
            })
        ]);

        console.log('✅ Seed concluído com sucesso!');
        console.log('\n📊 Usuários criados:');
        console.log('• Aluno: murilo@email.com / senha123');
        console.log('• Aluna: ana@email.com / senha123');
        console.log('• Personal: joao@email.com / senha123');
        console.log('• Personal: carla@email.com / senha123');
        console.log('\n🏋️ Exercícios e treinos criados:');
        console.log('• 10 exercícios');
        console.log('• 2 treinos com exercícios vinculados');
        console.log('\n🎯 Execute: npm start');
        console.log('Teste login: POST /auth/aluno ou POST /auth/personal');

    } catch (error) {
        console.error('❌ Erro no seed:', error);
    } finally {
        await sequelize.close();
    }
}

seedDatabase();