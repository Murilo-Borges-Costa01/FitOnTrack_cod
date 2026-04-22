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
                where: { nome: 'Supino reto' },
                defaults: {
                    nome: 'Supino reto',
                    descricao: 'Exercício para peito com barra ou halteres.',
                    grupo_muscular_id: grupoPorNome.Peito.id
                }
            }),
            Exercicio.findOrCreate({
                where: { nome: 'Agachamento livre' },
                defaults: {
                    nome: 'Agachamento livre',
                    descricao: 'Movimento composto para membros inferiores.',
                    grupo_muscular_id: grupoPorNome.Perna.id
                }
            }),
            Exercicio.findOrCreate({
                where: { nome: 'Rosca direta' },
                defaults: {
                    nome: 'Rosca direta',
                    descricao: 'Exercício clássico para bíceps.',
                    grupo_muscular_id: grupoPorNome.Bíceps.id
                }
            }),
            Exercicio.findOrCreate({
                where: { nome: 'Tríceps corda' },
                defaults: {
                    nome: 'Tríceps corda',
                    descricao: 'Foco na extensão de cotovelo para tríceps.',
                    grupo_muscular_id: grupoPorNome.Tríceps.id
                }
            }),
            Exercicio.findOrCreate({
                where: { nome: 'Puxada alta' },
                defaults: {
                    nome: 'Puxada alta',
                    descricao: 'Ativa dorsais e auxilia na postura.',
                    grupo_muscular_id: grupoPorNome.Costas.id
                }
            }),
            Exercicio.findOrCreate({
                where: { nome: 'Desenvolvimento ombro' },
                defaults: {
                    nome: 'Desenvolvimento ombro',
                    descricao: 'Fortalece deltoides e estabilidade do tronco.',
                    grupo_muscular_id: grupoPorNome.Ombros.id
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
        console.log('• 6 exercícios');
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