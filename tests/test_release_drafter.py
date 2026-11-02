import unittest
from pathlib import Path

import yaml


WORKFLOW_PATH = (
    Path(__file__).resolve().parents[1]
    / ".github/workflows/template_release_drafter.yml"
)


class ReleaseDrafterAuthenticationTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        workflow = yaml.safe_load(WORKFLOW_PATH.read_text())
        cls.job = workflow["jobs"]["update_release_draft"]
        cls.app_step = next(
            step for step in cls.job["steps"] if step.get("id") == "get_token"
        )
        cls.release_step = next(
            step
            for step in cls.job["steps"]
            if step.get("uses", "").startswith("release-drafter/release-drafter@")
        )

    def test_token_input_prefers_app_then_secret_then_builtin_token(self):
        self.assertEqual(
            self.release_step["with"].get("token"),
            "${{ env.USING_APP_CREDENTIALS == 'true' && "
            "steps.get_token.outputs.token || secrets.token || github.token }}",
        )

    def test_app_token_requires_both_credentials(self):
        self.assertEqual(
            self.job["env"]["USING_APP_CREDENTIALS"],
            "${{ secrets.client_id != '' && secrets.private_key != '' }}",
        )
        self.assertEqual(
            self.app_step["if"], "${{ env.USING_APP_CREDENTIALS == 'true' }}"
        )
        self.assertEqual(
            self.app_step["with"],
            {
                "client-id": "${{ secrets.client_id }}",
                "private-key": "${{ secrets.private_key }}",
            },
        )

    def test_existing_environment_token_is_preserved(self):
        self.assertEqual(
            self.release_step["env"]["GITHUB_TOKEN"],
            "${{ env.USING_APP_CREDENTIALS == 'true' && "
            "steps.get_token.outputs.token || secrets.token }}",
        )


if __name__ == "__main__":
    unittest.main()
