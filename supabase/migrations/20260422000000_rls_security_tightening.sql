-- 1) product_suggestion: UPDATE policy was USING (auth.uid() IS NOT NULL) - LEAKY
--    Bet kas logged-in galejo atnaujinti kito vartotojo suggestion'a.
--    Griezciname: tik savininkas (user_id) arba reviewer'is.
DROP POLICY IF EXISTS "Users can update suggestions" ON public.product_suggestion;

CREATE POLICY "Users can update own suggestions"
  ON public.product_suggestion
  FOR UPDATE
  USING ((auth.uid())::text = user_id)
  WITH CHECK ((auth.uid())::text = user_id);

-- Reviewer'iams leidziama updatinti (approve/reject) - atskiras policy.
CREATE POLICY "Reviewers can update suggestion status"
  ON public.product_suggestion
  FOR UPDATE
  USING ((auth.uid())::text = reviewed_by)
  WITH CHECK ((auth.uid())::text = reviewed_by);

-- 2) product_suggestion: DELETE policy truko - savininkas turi galimybe istrinti.
CREATE POLICY "Users can delete own suggestions"
  ON public.product_suggestion
  FOR DELETE
  USING ((auth.uid())::text = user_id);

-- 3) inventory: truko UPDATE ir DELETE policy - household members gali tik view+insert.
CREATE POLICY "Household members can update inventories"
  ON public.inventory
  FOR UPDATE
  USING (
    fk_environment_id IN (
      SELECT au.fk_environment_id FROM app_user au WHERE au.auth_uid = auth.uid()
    )
  )
  WITH CHECK (
    fk_environment_id IN (
      SELECT au.fk_environment_id FROM app_user au WHERE au.auth_uid = auth.uid()
    )
  );

CREATE POLICY "Household members can delete inventories"
  ON public.inventory
  FOR DELETE
  USING (
    fk_environment_id IN (
      SELECT au.fk_environment_id FROM app_user au WHERE au.auth_uid = auth.uid()
    )
  );

-- 4) notification: truko UPDATE policy - naudotojas negali pazymeti kaip perskaityto.
CREATE POLICY "Users update own notifications"
  ON public.notification
  FOR UPDATE
  USING (
    fk_budget_id IN (
      SELECT b.id_budget FROM budget b
      WHERE b.fk_administrator_id IN (
        SELECT au.id_user FROM app_user au WHERE au.auth_uid = auth.uid()
      )
    )
  )
  WITH CHECK (
    fk_budget_id IN (
      SELECT b.id_budget FROM budget b
      WHERE b.fk_administrator_id IN (
        SELECT au.id_user FROM app_user au WHERE au.auth_uid = auth.uid()
      )
    )
  );

-- 5) calorie_entry, water_entry: truko UPDATE policy.
CREATE POLICY "Users can update own calorie entries"
  ON public.calorie_entry
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own water entries"
  ON public.water_entry
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
