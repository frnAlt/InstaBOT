/**
 * 48 Laws of Power Command
 * Generates wisdom and tactics from Robert Greene's 48 Laws of Power
 */

const axios = require('axios');

const BUILTIN_LAWS = [
  { number: 1, title: "Never Outshine the Master", content: "Always make those above you feel comfortably superior. In your desire to please or impress them, do not go too far in displaying your talents or you might accomplish the opposite – inspire fear and insecurity." },
  { number: 2, title: "Never Put Too Much Trust in Friends, Learn How to Use Enemies", content: "Be wary of friends – they will betray you more quickly, for they are easily aroused to envy. Hire a former enemy and he will be more loyal than a friend, because he has more to prove." },
  { number: 3, title: "Conceal Your Intentions", content: "Keep people off-balance and in the dark by never revealing the purpose behind your actions. If they have no clue what you are up to, they cannot prepare a defense." },
  { number: 4, title: "Always Say Less Than Necessary", content: "When you are trying to impress people with words, the more you say, the more common you appear, and the less in control. Say less and remain mysterious." },
  { number: 5, title: "So Much Depends on Reputation – Guard It with Your Life", content: "Reputation is the cornerstone of power. Through reputation alone you can intimidate and win; once it slips, however, you are vulnerable on all sides." },
  { number: 6, title: "Court Attention at All Costs", content: "Everything is judged by its appearance; what is unseen counts for nothing. Never let yourself get lost in the crowd. Stand out. Be conspicuous, at all costs." },
  { number: 7, title: "Get Others to Do the Work for You, but Always Take the Credit", content: "Use the wisdom, knowledge, and legwork of other people to further your own cause. It saves you valuable time and energy while projecting effortless mastery." },
  { number: 8, title: "Make Other People Come to You – Use Bait If Necessary", content: "When you force the other person to act, you are the one in control. Make your opponent come to you, abandoning his own plans in the process." },
  { number: 9, title: "Win Through Your Actions, Never Through Argument", content: "Any momentary triumph gained through argument stirs up resentment and ill will. Demonstrate your point through actions without saying a word." },
  { number: 10, title: "Infection: Avoid the Unhappy and Unlucky", content: "Emotional states are as infectious as diseases. Associate with the happy and fortunate instead of being dragged down by chronic victims." },
  { number: 11, title: "Learn to Keep People Dependent on You", content: "To maintain your independence you must always be needed and wanted. The more you are relied upon, the more power and freedom you have." },
  { number: 12, title: "Use Selective Honesty and Generosity to Disarm Your Victim", content: "One sincere and honest move will cover over dozens of dishonest ones. Open-hearted gestures bring down the guard of the most suspicious people." },
  { number: 13, title: "When Asking for Help, Appeal to Self-Interest, Never to Mercy", content: "If you need to turn to an ally for help, do not appeal to gratitude or pity. Show them clearly how your request directly benefits them." },
  { number: 14, title: "Pose as a Friend, Work as a Spy", content: "Knowing about your rival is critical. Learn to probe and gather valuable intelligence in polite social encounters." },
  { number: 15, title: "Crush Your Enemy Totally", content: "A feared enemy must be crushed completely. If one ember is left smoldering, a fire will eventually break out again." },
  { number: 16, title: "Use Absence to Increase Respect and Honor", content: "Too much circulation makes the price go down. Create value through scarcity and tactical absence." },
  { number: 17, title: "Keep Others in Suspended Terror: Cultivate an Air of Unpredictability", content: "Humans are creatures of habit. Being deliberately unpredictable keeps others off-balance and defensive." },
  { number: 18, title: "Do Not Build Fortresses to Protect Yourself – Isolation is Dangerous", content: "The world is harsh and enemies are everywhere, but isolation cuts you off from valuable information and makes you an easy target." },
  { number: 19, title: "Know Who You're Dealing With – Do Not Offend the Wrong Person", content: "Never assume that everyone will react to your moves in the same way. Measure your opponents carefully before you act." },
  { number: 20, title: "Do Not Commit to Anyone", content: "Do not commit yourself to any side or cause but yourself. By maintaining your independence, you become the master of others." },
  { number: 21, title: "Play a Sucker to Catch a Sucker – Seem Dumber Than Your Mark", content: "No one likes feeling stupid. Make your victims feel smart – subtly allowing them to think they are smarter than you." },
  { number: 22, title: "Use the Surrender Tactic: Transform Weakness into Power", content: "When you are weaker, never fight for honor's sake; choose surrender instead. It gives you time to recover and wait for their power to wane." },
  { number: 23, title: "Concentrate Your Forces", content: "Conserve your energies by keeping them concentrated at their strongest point. You gain more by finding a rich mine and mining it deeper." },
  { number: 24, title: "Play the Perfect Courtier", content: "The courtier thrives in a world where everything revolves around power. Master the art of indirection, polite flattery, and yielding gracefully." },
  { number: 25, title: "Re-Create Yourself", content: "Do not accept the roles that society foists upon you. Re-create yourself by forging a new identity, one that commands attention and never bores." },
  { number: 26, title: "Keep Your Hands Clean", content: "You must seem a paragon of civility and efficiency. Use cat's-paws and scapegoats to disguise your involvement in mistakes or ugly deeds." },
  { number: 27, title: "Play on People's Need to Believe to Create a Cultlike Following", content: "People have an overwhelming desire to believe in something. Become the focal point of such desire by offering them a simple, utopian faith." },
  { number: 28, title: "Enter Action with Boldness", content: "If you are unsure of a course of action, do not attempt it. Your doubts and hesitations will infect your execution. Timidity is dangerous." },
  { number: 29, title: "Plan All the Way to the End", content: "The ending is everything. Plan all the way to it, taking into account all the possible consequences, obstacles, and twists of fortune." },
  { number: 30, title: "Make Your Accomplishments Seem Effortless", content: "Your actions must seem natural and executed with ease. All the toil and practice that go into them must be concealed." },
  { number: 31, title: "Control the Options: Get Others to Play with the Cards You Deal", content: "The best deceptions are the ones that seem to give the other person a choice: they feel they are in control, but are actually your puppets." },
  { number: 32, title: "Play to People's Fantasies", content: "The truth is often cold and harsh. Never appeal to truth unless you are prepared for the anger of disillusionment. Tap into the fantasies of the masses." },
  { number: 33, title: "Discover Each Man's Thumbscrew", content: "Everyone has a weakness, a gap in the castle wall. Once found, it gives you tremendous leverage." },
  { number: 34, title: "Be Royal in Your Own Fashion: Act Like a King to Be Treated Like One", content: "The way you carry yourself will often determine how you are treated. In the long run, appearing vulgar or common will make people disrespect you." },
  { number: 35, title: "Master the Art of Timing", content: "Never seem to be in a hurry. Hurrying betrays a lack of control over yourself and over time. Always seem patient, as if you know everything will come to you." },
  { number: 36, title: "Disdain Things You Cannot Have: Ignoring Them is the Best Revenge", content: "By acknowledging a petty problem, you give it existence and credibility. The more attention you pay an enemy, the stronger you make him." },
  { number: 37, title: "Create Compelling Spectacles", content: "Striking visual imagery and grand gestures create the aura of power. Stage spectacles for those around you to heighten your presence." },
  { number: 38, title: "Think as You Like, but Behave Like Others", content: "If you make a show of going against the times, flaunting your unconventional ideas, people will think that you only want attention. Keep your true thoughts to yourself." },
  { number: 39, title: "Stir Up Waters to Catch Fish", content: "Anger and emotion are strategically counterproductive. You must always stay calm and objective, but if you can make your enemies angry while staying calm, you gain the upper hand." },
  { number: 40, title: "Despise the Free Lunch", content: "What is offered for free is dangerous – it usually involves either a trick or a hidden obligation. What has worth is worth paying for." },
  { number: 41, title: "Avoid Stepping into a Great Man's Shoes", content: "What happens first always appears better and more original than what comes after. If you succeed a great man, you will have to accomplish double to outshine him." },
  { number: 42, title: "Strike the Shepherd and the Sheep Will Scatter", content: "Trouble can often be traced to a single strong individual. Neutralize the influence of the instigator and the entire faction will fall apart." },
  { number: 43, title: "Work on the Hearts and Minds of Others", content: "Coercion creates a reaction that will eventually work against you. You must seduce others into wanting to move in your direction." },
  { number: 44, title: "Disarm and Infuriate with the Mirror Effect", content: "The mirror reflects reality, but it is also the perfect tool for deception. When you mirror your enemies, doing exactly as they do, they cannot figure out your strategy." },
  { number: 45, title: "Preach the Need for Change, but Never Reform Too Much at Once", content: "Everyone understands the need for change in the abstract, but too much innovation is traumatic. Make a show of respecting old traditions while introducing subtle reforms." },
  { number: 46, title: "Never Appear Too Perfect", content: "Appearing better than others is always dangerous, but appearing to have no faults is the most dangerous of all. Envy creates silent enemies." },
  { number: 47, title: "Do Not Go Past the Mark You Aimed For; In Victory, Learn When to Stop", content: "The moment of victory is often the moment of greatest peril. In the heat of victory, arrogance can push you past your goal, creating new enemies." },
  { number: 48, title: "Assume Formlessness", content: "By taking a shape, by having a visible plan, you open yourself to attack. Instead of taking a form for your enemy to grasp, keep yourself adaptable and on the move." }
];

module.exports = {
  config: {
    name: "48law",
    aliases: ["law", "lawsofpower", "powerlaw", "48laws"],
    version: "1.0.0",
    author: "Gtajisan && frnAlt",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "48 Laws of Power wisdom generator"
    },
    longDescription: {
      en: "Fetches wisdom, strategy, and rules from Robert Greene's 48 Laws of Power."
    },
    category: "wisdom",
    guide: {
      en: "{p}48law [law number 1-48]"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const threadID = event.threadId || event.threadID;
    const requestedNum = parseInt(args[0], 10);
    const lawNumber = (!isNaN(requestedNum) && requestedNum >= 1 && requestedNum <= 48)
      ? requestedNum
      : Math.floor(Math.random() * 48) + 1;

    try {
      const response = await axios.get(`https://haji-mix.up.railway.app/api/law`, {
        params: { number: lawNumber },
        timeout: 5000
      }).catch(() => null);

      if (response?.data?.title && response?.data?.law) {
        const replyText = `📜 𝟰𝟴 𝗟𝗔𝗪𝗦 𝗢𝗙 𝗣𝗢𝗪𝗘𝗥\n\n📌 𝗟𝗮𝘄 ${lawNumber}: ${response.data.title}\n\n${response.data.law}`;
        return message ? message.reply(replyText) : api.sendMessage(replyText, threadID);
      }
    } catch (_) {}

    // Fallback to built-in laws list
    const matched = BUILTIN_LAWS.find(l => l.number === lawNumber) || BUILTIN_LAWS[(lawNumber - 1) % BUILTIN_LAWS.length];
    const replyText = `📜 𝟰𝟴 𝗟𝗔𝗪𝗦 𝗢𝗙 𝗣𝗢𝗪𝗘𝗥\n\n📌 𝗟𝗮𝘄 ${matched.number}: ${matched.title}\n\n${matched.content}`;
    return message ? message.reply(replyText) : api.sendMessage(replyText, threadID);
  },

  run: async function (params) {
    return module.exports.onStart(params);
  }
};
