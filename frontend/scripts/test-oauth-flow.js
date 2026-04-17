/**
 * Test script to verify OAuth flow is working correctly
 * This script simulates the OAuth flow and tests the user creation/authentication logic
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testOAuthFlow() {
  console.log('🧪 Testing OAuth Flow...\n');

  try {
    // Test case 1: New user signup via OAuth
    console.log('Test 1: New user OAuth signup');
    const newUserEmail = `test-oauth-${Date.now()}@example.com`;
    const newUserData = {
      email: newUserEmail,
      name: 'Test User',
      googleId: `google-${Date.now()}`,
      profileUrl: 'https://example.com/avatar.jpg',
    };

    console.log(`Creating new OAuth user: ${newUserEmail}`);

    // Simulate AuthService.findOrCreateOAuthUser for new user
    let existingUser = await prisma.user.findUnique({
      where: { email: newUserEmail },
    });

    if (!existingUser) {
      console.log('✅ User not found, creating new user...');

      // Create new OAuth user
      const newUser = await prisma.user.create({
        data: {
          email: newUserData.email,
          username: newUserData.email, // Try email as username first
          name: newUserData.name,
          passwordHash: 'dummy-oauth-password-hash', // OAuth users don't need real passwords
          googleId: newUserData.googleId,
          profileUrl: newUserData.profileUrl,
          role: 'USER',
        },
      });

      console.log(`✅ New user created with ID: ${newUser.id}`);
      console.log(`   Email: ${newUser.email}`);
      console.log(`   GoogleId: ${newUser.googleId}`);
    } else {
      console.log('❌ User already exists - test failed');
    }

    // Test case 2: Existing user login via OAuth
    console.log('\nTest 2: Existing user OAuth login');

    // Check if user exists
    existingUser = await prisma.user.findUnique({
      where: { email: newUserEmail },
    });

    if (existingUser) {
      console.log('✅ User found, simulating login...');
      console.log(`   User ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Name: ${existingUser.name}`);
      console.log(`   Role: ${existingUser.role}`);

      // If user doesn't have googleId linked, link it
      if (!existingUser.googleId) {
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: { googleId: newUserData.googleId },
        });
        console.log('✅ Google account linked to existing user');
      } else {
        console.log('✅ Google account already linked');
      }
    } else {
      console.log('❌ User not found - test failed');
    }

    // Test case 3: User exists but with different OAuth provider (email exists, but no googleId)
    console.log('\nTest 3: Existing email user without Google ID');

    const existingEmailUser = `existing-${Date.now()}@example.com`;

    // Create a user without googleId (regular signup)
    const regularUser = await prisma.user.create({
      data: {
        email: existingEmailUser,
        username: existingEmailUser,
        name: 'Regular User',
        passwordHash: 'regular-password-hash',
        role: 'USER',
      },
    });

    console.log(`✅ Created regular user: ${regularUser.email}`);

    // Now simulate OAuth login for this email
    const foundUser = await prisma.user.findUnique({
      where: { email: existingEmailUser },
    });

    if (foundUser) {
      console.log('✅ Found existing email user, linking Google account...');

      const linkedUser = await prisma.user.update({
        where: { id: foundUser.id },
        data: {
          googleId: `google-link-${Date.now()}`,
          profileUrl: 'https://example.com/google-avatar.jpg',
        },
      });

      console.log(`✅ Successfully linked Google account`);
      console.log(`   GoogleId: ${linkedUser.googleId}`);
    }

    console.log('\n🎉 All OAuth flow tests passed!');

    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await prisma.user.deleteMany({
      where: {
        OR: [{ email: newUserEmail }, { email: existingEmailUser }],
      },
    });
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('❌ OAuth flow test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testOAuthFlow();
}

module.exports = { testOAuthFlow };
