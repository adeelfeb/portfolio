/**
 * English blocked words list for content moderation.
 * Vulgar, obscene, spammy, and reportable terms.
 * Add or remove words as needed. Keep lowercase for matching.
 * Sources: common public blocklists (e.g. LDNOOBW, bad-words).
 */
module.exports = [
  'ass', 'asses', 'asshole', 'bastard', 'bitch', 'bitches', 'bloody', 'blowjob', 'blowjobs',
  'bs', 'bullshit', 'crap', 'cum', 'cunt', 'damn', 'dick', 'dicks', 'dumbass', 'fag', 'faggot',
  'fuck', 'fucked', 'fucker', 'fucking', 'fucks', 'hell', 'jackass', 'jerk', 'kike', 'nigga',
  'nigger', 'niggers', 'piss', 'pissed', 'porn', 'porno', 'pussy', 'shit', 'shitty', 'slut',
  'sluts', 'whore', 'whores', 'wtf', 'xxx',
  // Spam / phishing related
  'viagra', 'cialis', 'casino', 'lottery winner', 'click here free', 'congratulations winner',
  'nigerian prince', 'wire transfer', 'urgent money',
];
