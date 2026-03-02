import { supabase } from './lib/supabase.js'

const { data, error } = await supabase.from('your_table').select('*')

console.log(data, error)
