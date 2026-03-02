import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').trim().split('\n')
    .map(line => line.split('=').map(s => s.trim()))
)

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)

const messages = [
  { name: 'Maria Santos',        email: 'maria.santos@gmail.com',        message: "Excited to join the Arca community! I've been looking for a Filipino network in my area for a long time." },
  { name: 'Jose Reyes',          email: 'jose.reyes@yahoo.com',           message: "Kumusta! I'd love to know more about upcoming events in Metro Manila. Keep up the great work!" },
  { name: 'Ana dela Cruz',       email: 'ana.delacruz@outlook.com',       message: "I saw your post on Facebook and I'm very interested in volunteering. How can I get involved?" },
  { name: 'Miguel Torres',       email: 'miguel.torres@gmail.com',        message: "Are there any events planned for Cebu this year? Would love to connect with the local chapter." },
  { name: 'Grace Villanueva',    email: 'grace.v@icloud.com',             message: "My family just moved abroad and we're looking for a Filipino community to stay connected with our roots." },
  { name: 'Ramon Aquino',        email: 'ramon.aquino@proton.me',         message: "Great platform! I'd like to propose a partnership with our local cultural organization." },
  { name: 'Liza Mendoza',        email: 'liza.mendoza@gmail.com',         message: "I attended your last event and it was wonderful. When is the next one happening?" },
  { name: 'Carlo Bautista',      email: 'carlo.bautista@gmail.com',       message: "I'm a developer and would love to contribute to Arca's tech initiatives if you have any open projects." },
  { name: 'Patricia Lim',        email: 'patricia.lim@hotmail.com',       message: "Mabuhay! Just discovered Arca and I'm thrilled. Looking forward to meeting everyone." },
  { name: 'Eduardo Flores',      email: 'edu.flores@gmail.com',           message: "Do you have a chapter in Davao? I can help organize events down here in Mindanao." },
  { name: 'Sofia Castillo',      email: 'sofia.castillo@gmail.com',       message: "I'm a nurse working abroad and I'd love to connect with other healthcare workers in the Arca network." },
  { name: 'Andres Garcia',       email: 'andres.garcia@yahoo.com',        message: "Very impressed with your website! Is there a way to get featured as a community spotlight?" },
  { name: 'Camille Ramos',       email: 'camille.ramos@gmail.com',        message: "Hi! I'm a college student doing research on Filipino diaspora communities. Can I interview someone from Arca?" },
  { name: 'Benedict Cruz',       email: 'ben.cruz@gmail.com',             message: "I just signed up and I'm already feeling the community spirit. Salamat for building this!" },
  { name: 'Theresa Pascual',     email: 'theresa.p@outlook.com',          message: "Can you add more resources for newly arrived OFWs? That would really help my friends who just moved." },
  { name: 'Franz Navarro',       email: 'franz.navarro@gmail.com',        message: "Interested in your mentorship program. I'm a recent grad looking for career guidance from fellow Filipinos." },
  { name: 'Rosalie Tan',         email: 'rosalie.tan@icloud.com',         message: "The events you organize are so meaningful. My parents felt at home at the last fiesta. Thank you!" },
  { name: 'Dennis Soriano',      email: 'dennis.soriano@gmail.com',       message: "Would Arca consider hosting a business networking event? There are many Filipino entrepreneurs who need this." },
  { name: 'Maribel Ocampo',      email: 'maribel.ocampo@yahoo.com',       message: "I moved here 5 years ago and Arca has been a lifeline. Just wanted to say thank you from the bottom of my heart." },
  { name: 'Vincent Delos Reyes', email: 'vince.dr@gmail.com',             message: "Interested in sponsoring your next major event. Please send me your sponsorship deck when available." },
]

const { data, error } = await supabase.from('contact_messages').insert(messages).select()

if (error) {
  console.error('Error:', error.message)
  console.error('Hint:', error.hint || error.details || '')
  process.exit(1)
}

console.log(`Inserted ${data.length} messages successfully.\n`)
console.table(data.map(r => ({ id: r.id, name: r.name, email: r.email, created_at: r.created_at })))
