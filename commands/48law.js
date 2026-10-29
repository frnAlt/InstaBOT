'use strict';

/**
 * 48 Laws of Power Command
 * Provides timeless wisdom from Robert Greene's 48 Laws of Power
 */

const LAWS = [
  { num: 1, title: 'Never Outshine the Master', summary: 'Always make those above you feel comfortably superior. In your desire to please or impress them, do not go too far in displaying your talents or you might accomplish the opposite – inspire fear and insecurity.' },
  { num: 2, title: 'Never Put Too Much Trust in Friends, Learn How to Use Enemies', summary: 'Be wary of friends – they will betray you more quickly, for they are easily aroused to envy. They also become spoiled and tyrannical. But hire a former enemy and he will be more loyal than a friend, because he has more to prove.' },
  { num: 3, title: 'Conceal Your Intentions', summary: 'Keep people off-balance and in the dark by never revealing the purpose behind your actions. If they have no clue what you are up to, they cannot prepare a defense.' },
  { num: 4, title: 'Always Say Less than Necessary', summary: 'When you are trying to impress people with words, the more you say, the more common you appear, and the less in control. Powerful people impress and intimidate by saying less.' },
  { num: 5, title: 'So Much Depends on Reputation – Guard It with Your Life', summary: 'Reputation is the cornerstone of power. Through reputation alone you can intimidate and win; once it slips, however, you are vulnerable, and will be attacked on all sides.' },
  { num: 6, title: 'Court Attention at All Costs', summary: 'Everything is judged by its appearance; what is unseen counts for nothing. Never let yourself get lost in the crowd, then, or buried in oblivion. Stand out. Be conspicuous, at all costs.' },
  { num: 7, title: 'Get Others to Do the Work for You, but Always Take the Credit', summary: 'Use the wisdom, knowledge, and legwork of other people to further your own cause. Not only will such assistance save you valuable time and energy, it will give you a godlike aura of efficiency and speed.' },
  { num: 8, title: 'Make Other People Come to You – Use Bait If Necessary', summary: 'When you force the other person to act, you are the one in control. It is always better to make your opponent come to you, abandoning his own plans in the process. Lure him with fabulous gains – then attack.' },
  { num: 9, title: 'Win Through Your Actions, Never Through Argument', summary: 'Any momentary triumph you think you have gained through argument is really a Pyrrhic victory: The resentment and ill will you stir up is stronger and lasts longer than any momentary change of opinion.' },
  { num: 10, title: 'Infection: Avoid the Unhappy and Unlucky', summary: 'You can die from another’s misery – emotional states are as infectious as diseases. You may feel you are helping the drowning man, but you are only precipitating your own disaster.' },
  { num: 11, title: 'Learn to Keep People Dependent on You', summary: 'To maintain your independence you must always be needed and wanted. The more you are relied on, the more freedom you have. Make people depend on you for their happiness and prosperity and you have nothing to fear.' },
  { num: 12, title: 'Use Selective Honesty and Generosity to Disarm Your Victim', summary: 'One sincere and honest move will cover over dozens of dishonest ones. Open-hearted gestures of honesty and generosity bring down the guard of even the most suspicious people.' },
  { num: 13, title: 'When Asking for Help, Appeal to People’s Self-Interest, Never to Their Mercy or Gratitude', summary: 'If you need to turn to an ally for help, do not bother to remind him of your past assistance and good deeds. He will find a way to ignore you. Instead, uncover something in your request that will benefit him.' },
  { num: 14, title: 'Pose as a Friend, Work as a Spy', summary: 'Knowing about your rival is critical. Use spies to gather valuable information that will keep you a step ahead. Better still: Play the spy yourself. In polite social encounters, learn to probe.' },
  { num: 15, title: 'Crush Your Enemy Totally', summary: 'All great leaders since Moses have known that a feared enemy must be crushed completely. If one ember is left alight, no matter how dimly it smolders, a fire will eventually break out.' },
  { num: 16, title: 'Use Absence to Increase Respect and Honor', summary: 'Too much circulation makes the price go down: The more you are seen and heard from, the more common you appear. If you are already established in a group, temporary withdrawal from it will make you more talked about.' },
  { num: 17, title: 'Keep Others in Suspended Terror: Cultivate an Air of Unpredictability', summary: 'Humans are creatures of habit with an insatiable need to see familiarity in other people’s actions. Your predictability gives them a sense of control. Turn the tables: Be deliberately unpredictable.' },
  { num: 18, title: 'Do Not Build Fortresses to Protect Yourself – Isolation Is Dangerous', summary: 'The world is harsh and enemies are everywhere – everyone must protect themselves. A fortress seems the safest. But isolation exposes you to more dangers than it protects you from.' },
  { num: 19, title: 'Know Who You’re Dealing with – Do Not Offend the Wrong Person', summary: 'There are many different kinds of people in the world, and you can never assume that everyone will react to your strategies in the same way. Deceive or outmaneuver some people and they will spend the rest of their lives seeking revenge.' },
  { num: 20, title: 'Do Not Commit to Anyone', summary: 'It is the fool who always rushes to take sides. Do not commit yourself to any course or cause but yourself. By maintaining your independence, you become the master of others.' },
  { num: 21, title: 'Play a Sucker to Catch a Sucker – Seem Dumber than Your Mark', summary: 'No one likes feeling stupider than the next person. The trick, then, is to make your victims feel smart – and not just smart, but smarter than you are. Once convinced of this, they will never suspect that you may have ulterior motives.' },
  { num: 22, title: 'Use the Surrender Tactic: Transform Weakness into Power', summary: 'When you are weaker, never fight for honor’s sake; choose surrender instead. Surrender gives you time to recover, time to torment and irritate your conqueror, time to wait for his power to wane.' },
  { num: 23, title: 'Concentrate Your Forces', summary: 'Conserve your energies and strength by keeping them concentrated at their strongest point. You gain more by finding a rich mine and mining it deeper, than by flitting from one shallow mine to another.' },
  { num: 24, title: 'Play the Perfect Courtier', summary: 'The perfect courtier thrives in a world where everything revolves around power and political dexterity. He has mastered the art of indirection; he flatters, yields to superiors, and asserts power over others in the most oblique manner.' },
  { num: 25, title: 'Re-Create Yourself', summary: 'Do not accept the roles that society foists on you. Re-create yourself by forging a new identity, one that commands attention and never bores the audience.' },
  { num: 26, title: 'Keep Your Hands Clean', summary: 'You must seem a paragon of civility and efficiency: Your hands are never soiled by mistakes and nasty deeds. Maintain such a spotless appearance by using others as scapegoats and cat’s-paws.' },
  { num: 27, title: 'Play on People’s Need to Believe to Create a Cultlike Following', summary: 'People have an overwhelming desire to believe in something. Become the focal point of such desire by offering them a cause, a new faith to follow. Keep your words vague but full of promise.' },
  { num: 28, title: 'Enter Action with Boldness', summary: 'If you are unsure of a course of action, do not attempt it. Your doubts and hesitations will infect your execution. Timidity is dangerous: Better to enter with boldness. Any mistakes you commit through audacity are easily corrected with more audacity.' },
  { num: 29, title: 'Plan All the Way to the End', summary: 'The ending is everything. Plan all the way to it, taking into account all the possible consequences, obstacles, and twists of fortune that might reverse your hard work and give the glory to others.' },
  { num: 30, title: 'Make Your Accomplishments Seem Effortless', summary: 'Your actions must seem natural and executed with ease. All the toil and practice that go into them, and also all the clever tricks, must be concealed. When you act, act effortlessly, as if you could do much more.' },
  { num: 31, title: 'Control the Options: Get Others to Play with the Cards You Deal', summary: 'The best deceptions are the ones that seem to give the other person a choice: Your victims feel they are in control, but are actually your puppets. Give people options that come out in your favor whichever one they choose.' },
  { num: 32, title: 'Play to People’s Fantasies', summary: 'The truth is often avoided because it is ugly and unpleasant. Never appeal to truth and reality unless you are prepared for the anger that comes from disenchantment. Life is so harsh and distressing that the people who can manufacture romance or conjure up fantasy are like oases in the desert.' },
  { num: 33, title: 'Discover Each Man’s Thumbscrew', summary: 'Everyone has a weakness, a gap in the castle wall. That weakness is usually an insecurity, an uncontrollable emotion or need; it can also be a small secret pleasure. Either way, once found, it is a thumbscrew you can turn to your advantage.' },
  { num: 34, title: 'Be Royal in Your Own Fashion: Act like a King to Be Treated like One', summary: 'The way you carry yourself will often determine how you are treated: In the long run, appearing vulgar or common will make people disrespect you. For a king respects himself and inspires the same sentiment in others.' },
  { num: 35, title: 'Master the Art of Timing', summary: 'Never seem to be in a hurry – hurrying betrays a lack of control over yourself, and over time. Always seem patient, as if you know that everything will come to you eventually.' },
  { num: 36, title: 'Disdain Things You Cannot Have: Ignoring Them Is the Best Revenge', summary: 'By acknowledging petty problems or trivial enemies, you turn them into living realities. The more attention you pay an enemy, the stronger you make him. If there is something you want but cannot have, show contempt for it.' },
  { num: 37, title: 'Create Compelling Spectacles', summary: 'Striking imagery and grand symbolic gestures create the aura of power – everyone responds to them. Stage spectacles for those around you, full of stimulating visuals and radiant symbols that heighten your presence.' },
  { num: 38, title: 'Think as You Like but Behave like Others', summary: 'If you make a show of going against the times, flaunting your unconventional ideas and unorthodox ways, people will think that you only want attention and that you look down upon them. They will find a way to punish you for making them feel inferior.' },
  { num: 39, title: 'Stir Up Waters to Catch Fish', summary: 'Anger and emotion are strategically counterproductive. You must always stay calm and objective. But if you can make your enemies angry while staying calm yourself, you gain a decided advantage.' },
  { num: 40, title: 'Despise the Free Lunch', summary: 'What is offered for free is dangerous – it usually involves either a trick or a hidden obligation. What has worth is worth paying for. By paying your own way you stay clear of gratitude, guilt, and deceit.' },
  { num: 41, title: 'Avoid Stepping into a Great Man’s Shoes', summary: 'What happens first always appears better and more original than what comes after. If you succeed a great man or have a famous parent, you will have to accomplish double their achievements to outshine them.' },
  { num: 42, title: 'Strike the Shepherd and the Sheep Will Scatter', summary: 'Trouble can often be traced to a single strong individual – the stirrer, the arrogant underling, the poisoner of goodwill. If you allow such people room to operate, others will succumb to their influence. Neutralize their influence by banishing or isolating them.' },
  { num: 43, title: 'Work on the Hearts and Minds of Others', summary: 'Coercion creates a reaction that will eventually work against you. You must seduce others into wanting to move in your direction. A person you have seduced becomes your loyal pawn.' },
  { num: 44, title: 'Disarm and Infuriate with the Mirror Effect', summary: 'The mirror reflects reality, but it is also the perfect tool for deception: When you mirror your enemies, doing exactly as they do, they cannot figure out your strategy. The Mirror Effect mocks and humiliates them, making them overreact.' },
  { num: 45, title: 'Preach the Need for Change, but Never Reform Too Much at Once', summary: 'Everyone understands the need for change in the abstract, but on the day-to-day level people are creatures of habit. Too much innovation is traumatic, and will lead to revolt.' },
  { num: 46, title: 'Never Appear Too Perfect', summary: 'Appearing better than others is always dangerous, but most dangerous of all is to appear to have no faults or weaknesses. Envy creates silent enemies. It is smart to occasionally display defects.' },
  { num: 47, title: 'Do Not Go Past the Mark You Aimed For; In Victory, Learn When to Stop', summary: 'The moment of victory is often the moment of greatest peril. In the heat of victory, arrogance and overconfidence can push you past the goal you had aimed for, and by going too far, you make more enemies than you defeat.' },
  { num: 48, title: 'Assume Formlessness', summary: 'By taking a shape, by having a visible plan, you open yourself to attack. Instead of taking a form for your enemy to grasp, keep yourself adaptable and on the move. Accept the fact that nothing is certain and no law is fixed.' }
];

module.exports = {
  config: {
    name: '48law',
    aliases: ['law', 'powerlaw', '48laws'],
    version: '1.0.0',
    author: 'frnAlt',
    cooldown: 2,
    role: 0,
    category: 'media',
    description: 'Read wisdom from Robert Greene’s 48 Laws of Power',
    usage: '48law [1-48 | random]'
  },

  async run({ api, event, args, message }) {
    const tid = event.threadID || event.threadId;

    let targetNum = 1;
    const arg = (args[0] || '').trim().toLowerCase();

    if (!arg || arg === 'random' || arg === 'r') {
      targetNum = Math.floor(Math.random() * 48) + 1;
    } else {
      const parsed = parseInt(arg, 10);
      if (isNaN(parsed) || parsed < 1 || parsed > 48) {
        const err = '❌ Please enter a valid law number between 1 and 48, or use *48law random';
        return message?.reply ? message.reply(err) : api.sendMessage(err, tid, undefined, event.messageID);
      }
      targetNum = parsed;
    }

    const law = LAWS[targetNum - 1];

    const text =
      `📜 𝟒𝟖 𝐋𝐀𝐖𝐒 𝐎𝐅 𝐏𝐎𝐖𝐄𝐑\n` +
      `🏛️ Law ${law.num}: ${law.title}\n` +
      `─`.repeat(26) + `\n` +
      `${law.summary}\n` +
      `─`.repeat(26) + `\n` +
      `💡 Author: Robert Greene | Use *48law <1-48>`;

    return message?.reply ? message.reply(text) : api.sendMessage(text, tid, undefined, event.messageID);
  }
};
